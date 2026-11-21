"""Claude Code Stop hook: auto-fix lint and format the files changed in the working tree.

TypeScript, JavaScript, CSS, JSON and HTML files in the pnpm workspace packages and api/ go through oxlint --fix
and prettier --write, using the configs and binaries at the repo root.
If errors remain that cannot be fixed automatically, the hook blocks the stop once and hands them to Claude;
when stop_hook_active is already true it only reports them to the user, so it can never loop.
Output is capped so a large error list does not flood the context.
"""

import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(os.environ.get("CLAUDE_PROJECT_DIR") or Path(__file__).resolve().parents[2])
SOURCE_DIRS = ("frontend/", "backend/", "tools/", "api/")
OXLINT_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
PRETTIER_EXT = OXLINT_EXT | {".css", ".json", ".html"}
SKIP_NAMES = {"pnpm-lock.yaml"}
MAX_REPORT = 4000


def changed_files() -> list[str]:
    out = subprocess.run(
        ["git", "status", "--porcelain", "-z", "--untracked-files=all"],
        cwd=ROOT,
        capture_output=True,
        check=True,
    ).stdout.decode()
    entries = out.split("\0")
    files, i = [], 0
    while i < len(entries):
        entry = entries[i]
        i += 1
        if len(entry) < 4:
            continue
        status, path = entry[:2], entry[3:]
        if status[0] in "RC":
            i += 1
        if "D" in status or not (ROOT / path).is_file():
            continue
        files.append(path)
    return files


def digest(paths: list[str]) -> dict[str, str]:
    return {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in paths if (ROOT / p).is_file()}


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)


def main() -> None:
    payload = json.loads(sys.stdin.read() or "{}")
    files = [f for f in changed_files() if f.startswith(SOURCE_DIRS) and Path(f).name not in SKIP_NAMES]
    lint = [f for f in files if Path(f).suffix in OXLINT_EXT]
    fmt = [f for f in files if Path(f).suffix in PRETTIER_EXT]
    if not lint and not fmt:
        return

    bin_dir = ROOT / "node_modules" / ".bin"
    if not (bin_dir / "oxlint").is_file() or not (bin_dir / "prettier").is_file():
        print(json.dumps({"systemMessage": "oxlint or prettier is missing: run pnpm install at the repo root"}))
        return

    before = digest(lint + fmt)
    problems: list[str] = []
    if lint:
        run([str(bin_dir / "oxlint"), "--fix", *lint])
    if fmt:
        run([str(bin_dir / "prettier"), "--write", "--ignore-unknown", "--log-level", "warn", *fmt])
    if lint:
        result = run([str(bin_dir / "oxlint"), "--format", "unix", *lint])
        if result.returncode != 0:
            problems.append("oxlint:\n" + (result.stdout + result.stderr).strip())
    after = digest(lint + fmt)
    touched = [p for p in before if before[p] != after.get(p)]

    if problems:
        report = "\n\n".join(problems)[:MAX_REPORT]
        if payload.get("stop_hook_active"):
            print(json.dumps({"systemMessage": "Lint errors remain after auto-fix:\n" + report}))
        else:
            reason = "Lint errors remain after auto-fix. Fix them, then stop:\n" + report
            print(json.dumps({"decision": "block", "reason": reason}))
        return
    if touched:
        print(json.dumps({"systemMessage": f"Lint/format auto-fixed {len(touched)} file(s): " + ", ".join(touched)}))


if __name__ == "__main__":
    main()
