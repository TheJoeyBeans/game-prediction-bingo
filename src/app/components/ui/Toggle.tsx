interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  labelClassName?: string;
}

const Toggle = ({
  checked,
  onChange,
  label,
  labelClassName = "",
}: ToggleProps) => (
  <label className="inline-flex cursor-pointer items-center gap-3 select-none">
    <span className={`text-sm font-medium text-mist-300 ${labelClassName}`}>
      {label}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-accent-500" : "bg-ink-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  </label>
);

export default Toggle;
