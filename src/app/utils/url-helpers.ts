export const encodeState = (jsonString: string) => {
  return btoa(encodeURIComponent(jsonString));
};

export const decodeState = (encoded: string) => {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decode state:", error);
    return null;
  }
};
