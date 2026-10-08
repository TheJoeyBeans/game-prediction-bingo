export const SITE_URL = "https://videogamebingo.com";

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
    themeName: "Game Awards",
    backgroundColor: "#1a1a1a", // Dark, classy background
    textColor: "#00d4ff", // Neon blue (from their branding)
    borderColor: "#003b4d",
    hoverColor: "#006b89",
    shadowColor: "#00000099",
    accentColor: "#00d4ff",
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

// Themes offered in the card maker (Game Awards and Summer Game Fest aren't ready yet)
export const PICKER_THEMES: ThemeKey[] = [
  "classicBingo",
  "nintendoDirect",
  "playstationStateOfPlay",
  "xbox",
];

export const KEYWORDS = [
  "Nintendo Direct Bingo Card",
  "Nintendo Direct Bingo",
  "Nintendo Direct Bingo Card Maker",
  "Nintendo Direct Prediction Bingo",
  "Nintendo Direct Prediction Bingo Card",
  "Nintendo Direct Prediction Bingo Card Maker",
  "PlayStation State of Play Bingo Card",
  "PlayStation State of Play Bingo",
  "PlayStation State of Play Bingo Card Maker",
  "PlayStation State of Play Prediction Bingo",
  "PlayStation State of Play Prediction Bingo Card",
  "PlayStation State of Play Prediction Bingo Card Maker",
  "Xbox Games Showcase Bingo Card",
  "Xbox Games Showcase Bingo",
  "Xbox Games Showcase Bingo Card Maker",
  "Xbox Games Showcase Prediction Bingo",
  "Xbox Games Showcase Prediction Bingo Card",
  "Xbox Games Showcase Prediction Bingo Card Maker",
  "Video Game Conference Bingo",
  "Video Game Conference Bingo Card",
  "Video Game Conference Bingo Card Maker",
  "Video Game Conference Prediction Bingo",
  "Video Game Conference Prediction Bingo Card",
  "Video Game Conference Prediction Bingo Card Maker",
  "Video Game Prediction Bingo",
  "Video Game Prediction Bingo Card",
  "Video Game Prediction Bingo Card Maker",
  "Video Game Bingo Card",
  "Video Game Bingo",
  "Video Game Bingo Card Maker",
  "Prediction Bingo Game",
  "Game Conference Bingo",
];
