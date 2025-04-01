import React from "react";

interface Theme {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  shadowColor: string;
}

interface PreviewBoardProps {
  gridSize: number;
  options: string[];
  includeFreeSpace: boolean;
  theme: Theme;
}

const PreviewBoard: React.FC<PreviewBoardProps> = ({
  gridSize,
  options,
  includeFreeSpace,
  theme,
}) => {
  const totalCells = gridSize * gridSize;
  const centerIndex = Math.floor((totalCells - 1) / 2);

  const getTextSize = (text: string) => {
    if (text.length > 30) return "text-xs";
    if (text.length > 20) return "text-sm";
    if (text.length > 10) return "text-base";
    return "text-lg";
  };

  return (
    <div
      className={`flex justify-center items-center p-4 rounded-lg`}
      style={{ backgroundColor: theme.shadowColor }}
    >
      <div
        className={`grid gap-1`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          boxShadow: `0 4px 8px ${theme.shadowColor}`,
        }}
      >
        {Array.from({ length: totalCells }).map((_, index) => {
          // Render 'Free Space' at the center if enabled
          if (includeFreeSpace && index === centerIndex) {
            return (
              <div
                key="free-space"
                className={`flex items-center justify-center text-center p-2 h-12 w-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-28 xl:h-28 font-semibold rounded-lg`}
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  border: `1px solid ${theme.borderColor}`,
                }}
              >
                Free Space
              </div>
            );
          }

          // Get the corresponding option (accounting for the 'Free Space')
          const optionIndex =
            includeFreeSpace && index > centerIndex ? index - 1 : index;
          const option = options[optionIndex] || "";
          const textSizeClass = getTextSize(option);

          return (
            <div
              key={index}
              className={`flex items-center justify-center text-center p-2 h-12 w-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-28 xl:h-28 font-semibold rounded-lg break-words`}
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                border: `1px solid ${theme.borderColor}`,
              }}
              // onMouseEnter={(e) =>
              //   (e.currentTarget.style.backgroundColor = theme.hoverColor)
              // }
              // onMouseLeave={(e) =>
              //   (e.currentTarget.style.backgroundColor = theme.backgroundColor)
              // }
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
    </div>
  );
};

export default PreviewBoard;
