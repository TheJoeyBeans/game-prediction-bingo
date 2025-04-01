import { useState } from "react";
import { THEMES } from "../../../lib/constants";

type ThemeKey = keyof typeof THEMES;

const ThemePicker = ({
  setBoardTheme,
}: {
  setBoardTheme: (theme: (typeof THEMES)[ThemeKey]) => void;
}) => {
  const [theme, setTheme] = useState<ThemeKey>("classicBingo"); // Default theme

  // Function to handle theme change
  const handleThemeChange = (newTheme: ThemeKey) => {
    setTheme(newTheme);
    setBoardTheme(THEMES[newTheme]); // Update the parent component's theme state
  };

  const themes = [
    { name: "classicBingo", label: "Classic Bingo" },
    { name: "nintendoDirect", label: "Nintendo Direct" },
    { name: "playstationStateOfPlay", label: "PlayStation State of Play" },
    { name: "xbox", label: "Xbox Games Showcase" },
    // { name: "gameAwards", label: "Game Awards" },
    // { name: "summerGameFest", label: "Summer Game Fest" },
  ];

  return (
    <div className="p-4 flex justify-center gap-2 flex-wrap">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => handleThemeChange(t.name as ThemeKey)}
          className={`p-2 rounded-lg font-semibold transition-colors duration-200 cursor-pointer ${
            theme === t.name
              ? "border border-blue-500"
              : "border border-gray-400"
          } ${
            theme === t.name
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          } hover:bg-gray-300`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default ThemePicker;
