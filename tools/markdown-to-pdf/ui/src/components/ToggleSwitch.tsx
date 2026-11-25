type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="mdpdf-switch">
      <input
        checked={checked}
        className="mdpdf-choice-input"
        onChange={(event) => onChange(event.target.checked)}
        role="switch"
        type="checkbox"
      />
      <span aria-hidden="true" className="mdpdf-switch-track">
        <span className="mdpdf-switch-knob" />
      </span>
      {label}
    </label>
  );
}
