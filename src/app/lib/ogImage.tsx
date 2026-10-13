import { ImageResponse } from "next/og";
import { THEMES, type ThemeKey } from "./constants";

// 1200 × 630 is the size Discord, X and Google expect for link previews
export const OG_SIZE = { width: 1200, height: 630 };

const GRID = 5;
const CELL = 62;
const GAP = 10;
const BOARD_PADDING = 14;
// A diagonal bingo plus a few stray marks
const MARKED = new Set([0, 6, 12, 18, 24, 3, 9, 15, 21]);

// Share image: site name, title and subtitle on the left, a bingo card in the theme's colors on the right.
// Only flexbox and inline styles work here (rendered by Satori, not a browser)
export const renderOgImage = ({
  title,
  subtitle,
  themeKey,
}: {
  title: string;
  subtitle: string;
  themeKey: ThemeKey;
}) => {
  const theme = THEMES[themeKey];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#07080d",
          backgroundImage: `radial-gradient(circle at 82% 30%, ${theme.accentColor}66, transparent 55%)`,
          color: "#eef0fa",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: 620,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                marginRight: 14,
                backgroundColor: "#ff3b5c",
              }}
            />
            Video Game Bingo
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
              {title}
            </div>
            <div style={{ marginTop: 24, fontSize: 32, lineHeight: 1.3, color: "#b6bbd3" }}>
              {subtitle}
            </div>
          </div>
          <div style={{ fontSize: 26, color: "#7f85a1" }}>videogamebingo.com</div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            // Padding counts toward the width here, so add it or the last square wraps
            width: GRID * (CELL + GAP) + BOARD_PADDING * 2,
            padding: BOARD_PADDING,
            borderRadius: 24,
            backgroundColor: theme.shadowColor,
          }}
        >
          {Array.from({ length: GRID * GRID }, (_, i) => (
            <div
              key={i}
              style={{
                width: CELL,
                height: CELL,
                margin: GAP / 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                backgroundColor: theme.backgroundColor,
                border: `3px solid ${theme.borderColor}`,
                color: theme.textColor,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {i === 12 ? (
                "FREE"
              ) : MARKED.has(i) ? (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: theme.accentColor,
                    opacity: 0.85,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE
  );
};
