type ColorOptionProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function ColorOption({ label, value, onChange }: ColorOptionProps) {
  return (
    <label>
      {label}
      <input
        aria-label={label}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
