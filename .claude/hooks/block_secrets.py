"""Claude Code PreToolUse hook for Bash: block `git add` and `git commit` when they would stage a secret.

A file counts as secret by name (.env files except .env.example, keys, certificates, credential JSON, .vercel/)
or by content (private key blocks and common token prefixes). For `git add` the hook asks git itself with
--dry-run, so pathspecs, globs and -A resolve exactly as git would; for `git commit` it checks what is staged,
plus tracked changes when -a is used. Exit code 2 blocks the command and hands the reason to Claude.
"""

import json
import os
import re
import shlex
import subprocess
import sys
from fnmatch import fnmatch
from pathlib import Path

ROOT = Path(os.environ.get("CLAUDE_PROJECT_DIR") or Path(__file__).resolve().parents[2])
SECRET_NAMES = (
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "id_rsa*",
    "id_ed25519*",
    "credentials*.json",
    "service-account*.json",
)
ALLOWED_NAMES = (".env.example",)
SECRET_CONTENT = re.compile(
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----"
    r"|vercel_blob_rw_[A-Za-z0-9]{16,}"
    r"|gh[pousr]_[A-Za-z0-9]{36,}"
    r"|github_pat_[A-Za-z0-9_]{40,}"
    r"|sk-[A-Za-z0-9_-]{32,}"
    r"|AKIA[0-9A-Z]{16}"
)
MAX_SCAN_BYTES = 1_000_000


def git(args: list[str]) -> list[str]:
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    return [line for line in result.stdout.splitlines() if line.strip()]


def segments(command: str) -> list[list[str]]:
    tokens = []
    for part in re.split(r"&&|\|\||;|\||\n", command):
        try:
            tokens.append(shlex.split(part))
        except ValueError:
            continue
    return [t for t in tokens if t]


def git_subcommand(tokens: list[str]) -> tuple[str, list[str]] | None:
    if Path(tokens[0]).name != "git":
        return None
    i = 1
    while i < len(tokens) and tokens[i].startswith("-"):
        i += 2 if tokens[i] in ("-C", "-c") else 1
    if i >= len(tokens):
        return None
    return tokens[i], tokens[i + 1 :]


def commits_all(args: list[str]) -> bool:
    return any(a in ("-a", "--all") or (re.fullmatch(r"-[a-zA-Z]+", a) and "a" in a) for a in args)


def files_to_stage(command: str) -> set[str]:
    files: set[str] = set()
    for tokens in segments(command):
        parsed = git_subcommand(tokens)
        if not parsed:
            continue
        sub, args = parsed
        if sub == "add":
            for line in git(["add", "--dry-run", *args]):
                match = re.match(r"add '(.+)'$", line)
                if match:
                    files.add(match.group(1))
        elif sub == "commit":
            files.update(git(["diff", "--cached", "--name-only"]))
            if commits_all(args):
                files.update(git(["diff", "--name-only"]))
    return files


def secret_reason(path: str) -> str | None:
    name = Path(path).name
    if name in ALLOWED_NAMES:
        return None
    if path.startswith(".vercel/") or any(fnmatch(name, pattern) for pattern in SECRET_NAMES):
        return "secret file name"
    file = ROOT / path
    if file.is_file() and file.stat().st_size <= MAX_SCAN_BYTES:
        try:
            if SECRET_CONTENT.search(file.read_text(errors="ignore")):
                return "secret-looking content"
        except OSError:
            return None
    return None


def main() -> None:
    payload = json.loads(sys.stdin.read() or "{}")
    command = payload.get("tool_input", {}).get("command", "")
    if "git" not in command or not re.search(r"\b(add|commit)\b", command):
        return
    found = [(path, reason) for path in sorted(files_to_stage(command)) if (reason := secret_reason(path))]
    if found:
        lines = "\n".join(f"- {path}: {reason}" for path, reason in found)
        print(
            f"Blocked: this command would stage secrets.\n{lines}\nUnstage or remove them, or add them to .gitignore.",
            file=sys.stderr,
        )
        sys.exit(2)


if __name__ == "__main__":
    main()
