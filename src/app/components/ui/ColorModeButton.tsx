"use client";

import Button from "./Button";
import { MoonIcon, SunIcon } from "./icons";
import { useColorMode } from "../../lib/colorMode";

// Switches between light and dark mode; the first visit follows the system setting
const ColorModeButton = () => {
  const [mode, changeMode] = useColorMode();
  const next = mode === "light" ? "dark" : "light";

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => mode && changeMode(next)}
    >
      {mode === "light" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
};

export default ColorModeButton;
