// Per-browser display preferences. Storage can be unavailable (private browsing, blocked
// site data), so failures just mean the preference isn't remembered
export const readPreference = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const savePreference = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Still applies for this page view
  }
};
