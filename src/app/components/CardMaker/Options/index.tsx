import React, { useState } from "react";
import { shuffleBoard } from "../../../utils/shuffleBoard";

interface OptionsProps {
  gridSize: number;
  setGridSize: (size: number) => void;
  options: string[] | [];
  setOptions: (options: string[]) => void;
  includeFreeSpace: boolean;
  setIncludeFreeSpace: (include: boolean) => void;
  totalCells: number;
  optionsLength: number;
  handleGenerateCard: () => void;
}

const Options = ({
  gridSize,
  setGridSize,
  options,
  setOptions,
  includeFreeSpace,
  setIncludeFreeSpace,
  totalCells,
  optionsLength,
  handleGenerateCard,
}: OptionsProps) => {
  const [inputValue, setInputValue] = useState("");
  const gridSizeOptions = [3, 5, 7]; // Possible grid sizes for the bingo card

  const handleAddOption = () => {
    if (inputValue.trim()) {
      setOptions([...options, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleDeleteOption = (index: number) => {
    // Remove the option at the specified index from the options array
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleShuffleBoard = () => {
    // Shuffle the options array and update the state
    const shuffledOptions = shuffleBoard([...options]);
    setOptions(shuffledOptions);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center">
      <h2 className="sm:text-2xl font-bold mb-6">Bingo Card Size</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {gridSizeOptions.map((size) => (
          <label key={size} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              id={`grid-size-${size}`}
              name="gridSize"
              value={size}
              checked={gridSize === size}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              className="w-4 h-4 text-blue-600 accent-blue-600"
            />
            <span className="text-lg">
              {size} x {size}
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          id="include-free-space"
          checked={includeFreeSpace}
          onChange={(e) => setIncludeFreeSpace(e.target.checked)}
          className="w-4 h-4 text-blue-600 accent-blue-600"
        />
        <label htmlFor="include-free-space" className="sm:text-lg">
          Include Free Space
        </label>
      </div>

      {optionsLength > totalCells && (
        <div className="bg-yellow-100 text-yellow-700 p-3 rounded-lg mb-6 w-full text-center">
          You have more options than needed, some options will be cut off.
        </div>
      )}

      <div className="flex gap-2 justify-center flex-wrap mx-auto mb-6">
        {options.map((option, i) => (
          <div
            key={option + i}
            className="relative bg-gray-100 text-gray-800 p-3 rounded-xl text-left border border-gray-300 hover:bg-gray-200 transition-colors duration-150 group"
          >
            {option}
            <button
              onClick={() => handleDeleteOption(i)}
              className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full w-6 h-6 cursor-pointer flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {options.length > 1 && (
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleShuffleBoard}
        >
          Randomize Order
        </button>
      )}
      <h2 className="sm:text-2xl font-bold mt-4 mb-4">Enter Bingo Options</h2>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddOption();
            }
          }}
          className="p-2 sm:p-4 border border-gray-300 rounded-lg w-40 sm:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Add an option"
        />
        <button
          onClick={handleAddOption}
          className="bg-blue-500 text-white px-1 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
        >
          Add Option
        </button>
      </div>
      <button
        onClick={handleGenerateCard}
        className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        disabled={optionsLength < totalCells}
      >
        Generate Bingo Card
      </button>
    </div>
  );
};

export default Options;
