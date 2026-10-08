import type { CSSProperties } from "react";
import { CheckIcon } from "../../ui/icons";
import { PICKER_THEMES, THEMES, type ThemeKey } from "../../../lib/constants";

interface ThemePickerProps {
  selected: ThemeKey;
  onChange: (themeKey: ThemeKey) => void;
}

const ThemePicker = ({ selected, onChange }: ThemePickerProps) => (
  <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
    {PICKER_THEMES.map((key) => {
      const theme = THEMES[key];
      const active = selected === key;

      return (
        <button
          key={key}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(key)}
          style={{ "--swatch": theme.accentColor } as CSSProperties}
          className={`relative flex cursor-pointer flex-col items-start gap-3 rounded-xl p-3 text-left transition duration-150 ${
            active
              ? "bg-white/[0.07] ring-2 ring-(--swatch) shadow-[0_0_24px_-8px_var(--swatch)]"
              : "ring-1 ring-inset ring-white/10 hover:bg-white/[0.04] hover:ring-white/20"
          }`}
        >
          {/* A tiny card in the theme's colors */}
          <span
            className="grid grid-cols-3 gap-0.5 rounded-md p-1"
            style={{ backgroundColor: theme.shadowColor }}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: theme.backgroundColor }}
              />
            ))}
          </span>
          <span className="text-sm leading-tight font-semibold">
            {theme.themeName}
          </span>
          {active && (
            <span className="absolute top-2.5 right-2.5 grid h-5 w-5 place-items-center rounded-full bg-(--swatch) text-xs text-white">
              <CheckIcon />
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default ThemePicker;
