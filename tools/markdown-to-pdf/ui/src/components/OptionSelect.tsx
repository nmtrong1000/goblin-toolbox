type OptionSelectProps<T extends string> = {
  label: string;
  value: T;
  choices: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function OptionSelect<T extends string>({
  label,
  value,
  choices,
  onChange,
}: OptionSelectProps<T>) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  );
}
