import type { CSSProperties } from "react";
import type { Theme } from "./constants";

// Recolors a primary Button to match a theme by overriding the accent color variables it uses.
// Only for enabled buttons: disabled ones keep the default gray so their text stays readable
export const themedButtonStyle = (theme: Theme) =>
  ({
    "--color-accent-500": theme.accentColor,
    "--color-accent-400": `color-mix(in srgb, ${theme.accentColor} 85%, white)`,
    color: theme.accentTextColor,
  }) as CSSProperties;
