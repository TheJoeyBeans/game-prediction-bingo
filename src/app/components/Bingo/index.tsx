import React, { useState } from "react";
import Image from "next/image";
import logos from "../../utils/logos";
import { Switch } from "@headlessui/react";
import { shuffleBoard } from "../../utils/shuffleBoard";

const getPlatformLogo = (platformColor: string) => {
  switch (platformColor) {
    case "#e60012":
      return { src: logos.nintendo, width: 350, height: 200 };
    case "#003087":
      return { src: logos.playstation, width: 300, height: 200 };
    case "#107c10":
      return { src: logos.xbox, width: 150, height: 100 };
    default:
      return null;
  }
};

interface Theme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  shadowColor: string;
}

interface BingoCardProps {
  gridSize: number;
  options: string[];
  includeFreeSpace: boolean;
  theme: Theme;
  cardUrl?: string;
}

const BingoCard = ({
  gridSize,
  options,
  includeFreeSpace,
  theme,
  cardUrl,
}: BingoCardProps) => {
  const [urlCopied, setUrlCopied] = useState(false);
  const [displayUI, setDisplayUI] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [displayOptions, setSelectDisplayOptions] = useState(options);
  const totalCells = gridSize * gridSize;
  const centerIndex = Math.floor((totalCells - 1) / 2);
  const platformLogo = getPlatformLogo(theme.backgroundColor);

  const handleShuffleBoard = () => {
    const shuffledOptions = shuffleBoard([...displayOptions]);
    setSelectedOptions([]);
    setSelectDisplayOptions(shuffledOptions);
  };

  const getTextSize = (text: string) => {
    if (text.length > 30) return "text-xs";
    if (text.length > 20) return "text-sm";
    if (text.length > 10) return "text-base";
    return "text-lg";
  };

  const handleShareClick = () => {
    if (cardUrl) {
      navigator.clipboard.writeText(cardUrl).then(() => {});
      setUrlCopied(true);
    }
  };

  const handleOptionClick = (index: number) => {
    if (selectedOptions.includes(index)) {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== index));
    } else {
      setSelectedOptions([...selectedOptions, index]);
    }
  };

  return (
    <div
      className={`relative flex justify-center items-center min-h-screen min-w-full`}
      style={{
        backgroundColor: theme.shadowColor,
      }}
    >
      <button
        onClick={() => (window.location.href = "/")}
        className="absolute top-4 left-4 bg-white rounded-2xl py-1 px-3 cursor-pointer shadow-lg hover:bg-gray-300 transition duration-300 ease-in-out"
        style={{ display: !displayUI ? "block" : "none" }}
      >
        Home
      </button>
      <button
        onClick={handleShuffleBoard}
        className="absolute top-16 left-4 bg-white rounded-2xl py-1 px-3 cursor-pointer shadow-lg hover:bg-gray-300 transition duration-300 ease-in-out"
        style={{ display: !displayUI ? "block" : "none" }}
      >
        Shuffle
      </button>

      {platformLogo && (
        <div className="absolute top-0 mt-10 left-1/2 transform -translate-x-1/2 bg-white p-2 px-10 rounded-lg shadow-md flex items-center justify-center">
          <Image
            src={platformLogo.src}
            alt="Platform Logo"
            width={platformLogo.width}
            height={platformLogo.height}
          />
        </div>
      )}

      <div className="absolute top-4 right-4">
        {!displayUI && (
          <span className="text-white mr-2 font-semibold">Display UI</span>
        )}
        <Switch
          checked={displayUI}
          onChange={setDisplayUI}
          className={`${
            !displayUI ? "bg-green-500" : "bg-gray-300"
          } relative inline-flex items-center h-5 w-10 rounded-full shadow-lg transition-colors duration-300 ease-in-out cursor-pointer`}
        >
          <span
            className={`${
              !displayUI ? "translate-x-5 bg-white" : "translate-x-1 bg-white"
            } inline-block h-4 w-4 rounded-full transform transition-transform duration-300`}
          />
        </Switch>
      </div>

      <div
        className={`grid gap-1`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          boxShadow: `0 4px 8px ${theme.shadowColor}`,
        }}
      >
        {Array.from({ length: totalCells }).map((_, index) => {
          if (includeFreeSpace && index === centerIndex) {
            return (
              <div
                key={index}
                className={`relative flex items-center justify-center text-center p-2 h-12 w-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-28 xl:h-28 font-semibold rounded-lg cursor-pointer break-words text-xs sm:text-lg text-ellipsis md:overflow-hidden ${
                  selectedOptions.includes(index) ? "selected" : ""
                }`}
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  border: `1px solid ${theme.borderColor}`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = theme.hoverColor)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    theme.backgroundColor)
                }
                onClick={() => handleOptionClick(index)}
              >
                Free Space
                {selectedOptions.includes(index) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[60%] h-[60%] bg-white opacity-80 rounded-full pointer-events-none" />
                  </div>
                )}
              </div>
            );
          }

          const optionIndex =
            includeFreeSpace && index > centerIndex ? index - 1 : index;
          const option = displayOptions[optionIndex] || "";
          const textSizeClass = getTextSize(option);

          return (
            <div
              key={index}
              className={`relative flex items-center justify-center text-center p-2 h-12 w-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-28 xl:h-28 font-semibold rounded-lg break-words cursor-pointer ${
                selectedOptions.includes(index) ? "selected" : ""
              }`}
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                border: `1px solid ${theme.borderColor}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = theme.hoverColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = theme.backgroundColor)
              }
              onClick={() => handleOptionClick(index)}
            >
              <span
                className={`break-words sm:${textSizeClass} text-xs text-ellipsis md:overflow-hidden`}
              >
                {option}
              </span>
              {selectedOptions.includes(index) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[60%] h-[60%] bg-white opacity-80 rounded-full pointer-events-none" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-4">
        <button
          onClick={handleShareClick}
          className="bg-blue-500 text-white py-2 px-4 rounded-xl shadow-lg cursor-pointer hover:bg-blue-600 transition duration-300 ease-in-out"
          style={{ display: !displayUI ? "block" : "none" }}
        >
          Share this Bingo Card
        </button>
      </div>
      {urlCopied && (
        <div className="absolute bottom-16 text-white py-2 px-4">
          Copied to clipboard
        </div>
      )}
    </div>
  );
};

export default BingoCard;
