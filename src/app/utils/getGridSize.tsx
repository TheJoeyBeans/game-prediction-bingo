export const getGridSize = (itemCount: number) => {
  if (itemCount <= 9) return 3; // 3x3 grid for 8 items + Free Space
  if (itemCount <= 16) return 4; // 4x4 grid for 15 items + Free Space
  if (itemCount <= 25) return 5; // 5x5 grid for 24 items + Free Space
  if (itemCount <= 36) return 6; // 6x6 grid for 35 items + Free Space
  return Math.ceil(Math.sqrt(itemCount)); // Fallback to a square root calculation for larger sets
};
