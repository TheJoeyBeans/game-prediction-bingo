interface SegmentedControlProps<T extends string | number> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

const SegmentedControl = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="grid w-full auto-cols-fr grid-flow-col gap-1 rounded-xl bg-ink-950/60 p-1 ring-1 ring-inset ring-white/10 sm:inline-grid sm:w-auto"
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.value)}
          className={`h-10 cursor-pointer rounded-lg px-5 text-sm font-semibold transition-colors duration-150 ${
            active
              ? "bg-accent-500 text-white shadow"
              : "text-mist-300 hover:bg-white/5 hover:text-mist-100"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
