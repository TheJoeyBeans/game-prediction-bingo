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
