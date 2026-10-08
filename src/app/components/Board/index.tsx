import type { CSSProperties } from "react";
import { THEMES, type ThemeKey } from "../../lib/constants";

// Largest a cell gets; below that the board shrinks to fit its container
const MAX_CELL_REM = 7;

// Text scales with the cell's width (cqi), clamped to readable bounds.
// Full class names are written out so Tailwind can find them in the source.
const getTextSize = (text: string) => {
  if (text.length > 30) return "text-[clamp(7px,11cqi,0.75rem)]";
  if (text.length > 20) return "text-[clamp(8px,12.5cqi,0.875rem)]";
  if (text.length > 10) return "text-[clamp(9px,14cqi,1rem)]";
  return "text-[clamp(10px,17cqi,1.125rem)]";
};

interface BoardProps {
  gridSize: number;
  options: string[];
  includeFreeSpace: boolean;
  themeKey: ThemeKey;
  selected?: Set<number>;
  onCellClick?: (index: number) => void;
  // Also cap the board by screen height, minus room for the surrounding UI
  fitViewport?: boolean;
}

const Board = ({
  gridSize,
  options,
  includeFreeSpace,
  themeKey,
  selected,
  onCellClick,
  fitViewport = false,
}: BoardProps) => {
  const theme = THEMES[themeKey];
  const totalCells = gridSize * gridSize;
  const centerIndex = Math.floor((totalCells - 1) / 2);
  const markerBackground = themeKey === "classicBingo" ? "bg-black" : "bg-white";
  const maxWidth = `${gridSize * MAX_CELL_REM}rem`;
  const Cell = onCellClick ? "button" : "div";

  return (
    <div
      className="mx-auto w-full rounded-2xl p-1.5 ring-1 ring-white/15 sm:p-2.5"
      style={{
        maxWidth: fitViewport
          ? `min(${maxWidth}, max(18rem, calc(100dvh - 15rem)))`
          : maxWidth,
        backgroundColor: theme.shadowColor,
        boxShadow: `0 0 80px -20px ${theme.accentColor}`,
      }}
    >
      <div
        className="grid gap-1 sm:gap-1.5"
        style={
          {
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            "--cell-bg": theme.backgroundColor,
            "--cell-hover": theme.hoverColor,
          } as CSSProperties
        }
      >
        {Array.from({ length: totalCells }, (_, index) => {
          const isFreeSpace = includeFreeSpace && index === centerIndex;
          const optionIndex =
            includeFreeSpace && index > centerIndex ? index - 1 : index;
          const text = isFreeSpace ? "Free Space" : options[optionIndex] || "";
          const isSelected = selected?.has(index) ?? false;

          return (
            <Cell
              key={index}
              {...(onCellClick && {
                type: "button" as const,
                "aria-pressed": isSelected,
                onClick: () => onCellClick(index),
              })}
              className={`@container relative aspect-square overflow-hidden rounded-lg bg-(--cell-bg) font-semibold ${
                onCellClick
                  ? "cursor-pointer transition-transform duration-100 hover:bg-(--cell-hover) active:scale-95"
                  : ""
              }`}
              style={{
                color: theme.textColor,
                border: `1px solid ${theme.borderColor}`,
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center p-[6cqi] text-center">
                <span
                  className={`${getTextSize(text)} max-h-full overflow-hidden leading-tight break-words hyphens-auto`}
                >
                  {text}
                </span>
              </span>
              {isSelected && (
                <span
                  className={`pointer-events-none absolute inset-[18%] rounded-full ${markerBackground} opacity-85 animate-daub motion-reduce:animate-none`}
                />
              )}
            </Cell>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
