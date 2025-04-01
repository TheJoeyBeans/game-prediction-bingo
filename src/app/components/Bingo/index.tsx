import React, { useState } from "react";

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
  const totalCells = gridSize * gridSize;
  const centerIndex = Math.floor((totalCells - 1) / 2);

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
      >
        Home
      </button>

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
                key="free-space"
                className={`flex items-center justify-center text-center p-2 h-12 w-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-28 xl:h-28 font-semibold rounded-lg cursor-pointer`}
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
              >
                Free Space
              </div>
            );
          }

          const optionIndex =
            includeFreeSpace && index > centerIndex ? index - 1 : index;
          const option = options[optionIndex] || "";
          const textSizeClass = getTextSize(option);

          return (
            <div
              key={index}
              className={`flex items-center justify-center text-center p-2 h-12 w-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-28 xl:h-28 font-semibold rounded-lg break-words cursor-pointer`}
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
            >
              <span
                className={`break-words ${textSizeClass} text-ellipsis overflow-hidden`}
              >
                {option}
              </span>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-4">
        <button
          onClick={handleShareClick}
          className="bg-blue-500 text-white py-2 px-4 rounded-xl shadow-lg cursor-pointer hover:bg-blue-600 transition duration-300 ease-in-out"
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
