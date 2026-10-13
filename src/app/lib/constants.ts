export const SITE_URL = "https://videogamebingo.com";
export const KOFI_URL = "https://ko-fi.com/thejoeybeans";

// Anonymous cards are deleted after this many days without a visit
export const ANON_CARD_TTL_DAYS = 7;

export const THEMES = {
  classicBingo: {
    themeName: "Classic Bingo",
    backgroundColor: "#ffffff", // White background for classic bingo
    textColor: "#000000", // Black text for contrast
    borderColor: "#cccccc", // Light gray border for cells
    hoverColor: "#f0f0f0", // Light gray for hover effect
    shadowColor: "#999999", // Shadow color for depth
    accentColor: "#7c5cff", // Glow behind the page and board
  },
  nintendoDirect: {
    themeName: "Nintendo Direct",
    backgroundColor: "#e60012", // Nintendo red
    textColor: "#ffffff",
    borderColor: "#b3000e",
    hoverColor: "#cc000f",
    shadowColor: "#99000b",
    accentColor: "#ff1f3d",
  },
  playstationStateOfPlay: {
    themeName: "PlayStation State of Play",
    backgroundColor: "#003087", // PlayStation blue
    textColor: "#ffffff",
    borderColor: "#001f5b",
    hoverColor: "#002766",
    shadowColor: "#001233",
    accentColor: "#2f7bff",
  },
  xbox: {
    themeName: "Xbox Games Showcase",
    backgroundColor: "#107c10", // Xbox green
    textColor: "#ffffff",
    borderColor: "#0a5a0a",
    hoverColor: "#0c6b0c",
    shadowColor: "#083f08",
    accentColor: "#22c55e",
  },
  gameAwards: {
    themeName: "The Game Awards",
    backgroundColor: "#141210", // Near-black, like the show's branding
    textColor: "#e8c49a", // Gold from the logo
    borderColor: "#4a3a28",
    hoverColor: "#211c17",
    shadowColor: "#050505",
    accentColor: "#d9a56b",
  },
  summerGameFest: {
    themeName: "Summer Game Fest",
    backgroundColor: "#333366", // Deep blue-purple tone
    textColor: "#ff6bd6", // Vibrant pink from SGF branding
    borderColor: "#290e4e",
    hoverColor: "#452980",
    shadowColor: "#1c1038",
    accentColor: "#ff6bd6",
  },
};

export type ThemeKey = keyof typeof THEMES;
export type Theme = (typeof THEMES)[ThemeKey];

// Themes offered in the card maker (Summer Game Fest isn't ready yet)
export const PICKER_THEMES: ThemeKey[] = [
  "classicBingo",
  "nintendoDirect",
  "playstationStateOfPlay",
  "xbox",
  "gameAwards",
];
