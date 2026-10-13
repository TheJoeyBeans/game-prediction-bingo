"use client";

import { useEffect, useState } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { COLOR_MODE_KEY } from "./colorModeScript";
import { savePreference } from "./preferences";

export type ColorMode = "light" | "dark";

// The mode in effect (saved choice, else the system's) and a setter that saves the choice.
// null until mounted, since the server can't know either
export const useColorMode = () => {
  const [mode, setMode] = useState<ColorMode | null>(null);

  useEffect(() => {
    const saved = document.documentElement.dataset.colorMode;
    setMode(
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
    );
  }, []);

  const changeMode = (next: ColorMode) => {
    sendGTMEvent({ event: "color_mode_change", mode: next });
    document.documentElement.dataset.colorMode = next;
    savePreference(COLOR_MODE_KEY, next);
    setMode(next);
  };

  return [mode, changeMode] as const;
};
