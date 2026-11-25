type TypingPlaceholderProps = { text: string; typing: boolean };

export function TypingPlaceholder({ text, typing }: TypingPlaceholderProps) {
  return (
    <span aria-hidden="true" className="typing-placeholder">
      {text}
      {typing && <span className="typing-caret" />}
    </span>
  );
}
