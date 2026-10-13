// Board squares ("cells") are numbered row by row. Predictions ("options") fill them in order,
// except that with a free space the center cell has no prediction and the rest shift by one.

export const centerCell = (gridSize: number) =>
  Math.floor((gridSize * gridSize - 1) / 2);

// How many predictions fit on the board
export const boardSlots = (gridSize: number, includeFreeSpace: boolean) =>
  gridSize * gridSize - (includeFreeSpace ? 1 : 0);

export const isFreeCell = (
  cell: number,
  gridSize: number,
  includeFreeSpace: boolean
) => includeFreeSpace && cell === centerCell(gridSize);

export const cellToOption = (
  cell: number,
  gridSize: number,
  includeFreeSpace: boolean
) => (includeFreeSpace && cell > centerCell(gridSize) ? cell - 1 : cell);

export const optionToCell = (
  option: number,
  gridSize: number,
  includeFreeSpace: boolean
) => (includeFreeSpace && option >= centerCell(gridSize) ? option + 1 : option);

// Every row, column and both diagonals, as lists of cells
const boardLines = (gridSize: number) => {
  const cells = Array.from({ length: gridSize }, (_, i) => i);
  return [
    ...cells.map((row) => cells.map((col) => row * gridSize + col)),
    ...cells.map((col) => cells.map((row) => row * gridSize + col)),
    cells.map((i) => i * gridSize + i),
    cells.map((i) => i * gridSize + (gridSize - 1 - i)),
  ];
};

// Lines where every square is marked; the free space always counts
export const completedLines = (
  gridSize: number,
  includeFreeSpace: boolean,
  selected: Set<number>
) =>
  boardLines(gridSize).filter((line) =>
    line.every(
      (cell) => selected.has(cell) || isFreeCell(cell, gridSize, includeFreeSpace)
    )
  );
