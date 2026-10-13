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
      size="sm"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => mode && changeMode(next)}
    >
      {next === "dark" ? <MoonIcon /> : <SunIcon />}
      <span className="hidden sm:inline">
        {next === "dark" ? "Dark mode" : "Light mode"}
      </span>
    </Button>
  );
};

export default ColorModeButton;
