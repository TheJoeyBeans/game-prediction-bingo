"use client";

import { useState } from "react";
import PreviewBoard from "./PreviewBoard";
import { encodeState } from "../../utils/url-helpers";
import Options from "./Options";
import ThemePicker from "./ThemePicker";
import { THEMES } from "../../lib/constants";

const CardMaker = () => {
  const [includeFreeSpace, setIncludeFreeSpace] = useState(true);
  const [boardTheme, setBoardTheme] = useState(THEMES.classicBingo);
  const [gridSize, setGridSize] = useState(5);
  const [options, setOptions] = useState<string[]>([]);
  const totalCells = gridSize * gridSize;
  const optionsLength = includeFreeSpace ? options.length + 1 : options.length;

  const handleGenerateCard = () => {
    const state = {
      includeFreeSpace,
      boardTheme,
      gridSize,
      options,
    };
    const stateString = JSON.stringify(state);
    const encodedState = encodeState(stateString);
    const newUrl = `${window.location.origin}${window.location.pathname}?s=${encodedState}`;
    window.location.href = newUrl;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 gap-6 bg-gradient-to-b from-blue-50 to-blue-100">
      <h1 className="text-4xl font-bold text-gray-800 py-2 px-7">
        Make Your Bingo Card
      </h1>

      <div className="w-full flex justify-center mb-6">
        <ThemePicker setBoardTheme={setBoardTheme} />
      </div>

      <div
        className={`flex ${
          gridSize !== 7
            ? "flex-col lg:flex-row"
            : "flex-col items-center justify-center"
        } flex-wrap w-full gap-6 bg-white rounded-lg shadow-lg p-4`}
      >
        <div className="flex-1 min-w-[300px] p-4">
          <Options
            gridSize={gridSize}
            setGridSize={setGridSize}
            options={options}
            setOptions={setOptions}
            includeFreeSpace={includeFreeSpace}
            setIncludeFreeSpace={setIncludeFreeSpace}
            totalCells={totalCells}
            optionsLength={optionsLength}
            handleGenerateCard={handleGenerateCard}
          />
        </div>

        <div className="flex-1 min-w-[300px] p-4">
          <PreviewBoard
            gridSize={gridSize}
            options={options}
            includeFreeSpace={includeFreeSpace}
            theme={boardTheme}
          />
        </div>
      </div>
    </div>
  );
};

export default CardMaker;
