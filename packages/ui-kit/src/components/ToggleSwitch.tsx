type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="common-switch">
      <input
        checked={checked}
        className="common-choice-input"
        onChange={(event) => onChange(event.target.checked)}
        role="switch"
        type="checkbox"
      />
      <span aria-hidden="true" className="common-switch-track">
        <span className="common-switch-knob" />
      </span>
      {label}
    </label>
  );
}
