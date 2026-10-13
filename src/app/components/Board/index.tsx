import type { CSSProperties } from "react";
import { THEMES, type ThemeKey } from "../../lib/constants";
import type { Swap } from "../CardMaker/useSwap";
import { cellToOption, isFreeCell } from "../../utils/boardLayout";

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
  // Card maker preview only: pick or drag squares to swap their predictions
  swap?: Pick<Swap, "picked" | "drag" | "pick" | "startDrag">;
  // Easier on the eyes: neutral squares with the theme's color on borders and marks, and no glow
  soft?: boolean;
}

const Board = ({
  gridSize,
  options,
  includeFreeSpace,
  themeKey,
  selected,
  onCellClick,
  fitViewport = false,
  swap,
  soft = false,
}: BoardProps) => {
  const theme = THEMES[themeKey];
  // Soft colors use the site's surface and text colors, so they follow light and dark mode
  const colors = soft
    ? {
        board: "var(--color-ink-800)",
        cell: "var(--color-ink-900)",
        cellHover: "var(--color-ink-700)",
        text: "var(--color-mist-100)",
        border: theme.accentColor,
        marker: theme.accentColor,
      }
    : {
        board: theme.shadowColor,
        cell: theme.backgroundColor,
        cellHover: theme.hoverColor,
        text: theme.textColor,
        border: theme.borderColor,
        marker: theme.markerColor,
      };
  const totalCells = gridSize * gridSize;
  const maxWidth = `${gridSize * MAX_CELL_REM}rem`;

  return (
    <div
      className="mx-auto w-full rounded-2xl p-1.5 ring-1 ring-veil/15 sm:p-2.5"
      style={{
        maxWidth: fitViewport
          ? `min(${maxWidth}, max(18rem, calc(100dvh - 15rem)))`
          : maxWidth,
        backgroundColor: colors.board,
        boxShadow: soft ? "none" : `0 0 56px -28px ${theme.accentColor}`,
      }}
    >
      <div
        className="grid gap-1 sm:gap-1.5"
        style={
          {
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            "--cell-bg": colors.cell,
            "--cell-hover": colors.cellHover,
          } as CSSProperties
        }
      >
        {Array.from({ length: totalCells }, (_, index) => {
          const isFreeSpace = isFreeCell(index, gridSize, includeFreeSpace);
          const optionIndex = cellToOption(index, gridSize, includeFreeSpace);
          const text = isFreeSpace ? "Free Space" : options[optionIndex] || "";
          const isSelected = selected?.has(index) ?? false;
          const swappable =
            swap !== undefined && !isFreeSpace && optionIndex < options.length;
          const isPicked = swappable && swap?.picked === optionIndex;
          const isDragSource = swappable && swap?.drag?.from === optionIndex;
          const isDropTarget =
            swappable && !isDragSource && swap?.drag?.over === optionIndex;
          const Cell = onCellClick || swappable ? "button" : "div";

          return (
            <Cell
              key={index}
              {...(onCellClick && {
                type: "button" as const,
                "aria-pressed": isSelected,
                onClick: () => onCellClick(index),
              })}
              {...(swap &&
                swappable && {
                  type: "button" as const,
                  "aria-pressed": isPicked,
                  "data-swap-index": optionIndex,
                  onClick: () => swap.pick(optionIndex),
                  onPointerDown: swap.startDrag(optionIndex),
                })}
              className={`@container relative aspect-square overflow-hidden rounded-lg bg-(--cell-bg) font-semibold ${
                onCellClick
                  ? "cursor-pointer transition-transform duration-100 hover:bg-(--cell-hover) active:scale-95"
                  : ""
              } ${
                swappable
                  ? "cursor-grab transition duration-100 select-none hover:bg-(--cell-hover)"
                  : ""
              } ${isPicked ? "z-10 scale-95 outline-3 outline-offset-2 outline-white" : ""} ${
                isDropTarget
                  ? "z-10 outline-2 outline-offset-2 outline-white/80 outline-dashed"
                  : ""
              } ${isDragSource ? "opacity-40" : ""}`}
              style={{
                color: colors.text,
                border: `1px solid ${colors.border}`,
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
                // A dauber stamp: a ring in the theme's marker color with a light tint, so the text stays readable
                <span
                  className="pointer-events-none absolute inset-[12%] rounded-full animate-daub motion-reduce:animate-none"
                  style={{
                    border: `5cqi solid ${colors.marker}`,
                    backgroundColor: `color-mix(in srgb, ${colors.marker} 28%, transparent)`,
                    boxShadow: `0 0 6cqi color-mix(in srgb, ${colors.marker} 40%, transparent)`,
                  }}
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
