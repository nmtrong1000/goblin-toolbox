import type { ReactNode } from 'react';

export type SegmentChoice<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  iconOnly?: boolean;
};

type SegmentedControlProps<T extends string> = {
  legend: string;
  name: string;
  value: T | undefined;
  choices: SegmentChoice<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  legend,
  name,
  value,
  choices,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className="common-field">
      <legend className="common-field-label">{legend}</legend>
      <div className="common-segmented">
        {choices.map((choice) => (
          <label
            className="common-segment"
            key={choice.value}
            title={choice.iconOnly ? choice.label : undefined}
          >
            <input
              checked={choice.value === value}
              className="common-choice-input"
              name={name}
              onChange={() => onChange(choice.value)}
              type="radio"
              value={choice.value}
            />
            <span className="common-segment-face">
              {choice.icon}
              <span className={choice.iconOnly ? 'common-sr-only' : undefined}>{choice.label}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
