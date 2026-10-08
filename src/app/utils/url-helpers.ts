import { THEMES, type ThemeKey } from "../lib/constants";

export interface CardState {
  gridSize: number;
  options: string[];
  includeFreeSpace: boolean;
  themeKey: ThemeKey;
}

// Cards are compressed into the link, so anyone can craft one: cap what we accept
const MAX_ENCODED_LENGTH = 4096;
const MAX_OPTIONS = 100;
const MAX_OPTION_LENGTH = 200;

const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

const isThemeKey = (value: unknown): value is ThemeKey =>
  THEME_KEYS.includes(value as ThemeKey);

// Older links stored the whole theme object, so match it back by name
const themeKeyFromName = (name: unknown) =>
  THEME_KEYS.find((key) => THEMES[key].themeName === name);

const toBase64Url = (bytes: Uint8Array) =>
  btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (encoded: string) =>
  Uint8Array.from(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")), (char) =>
    char.charCodeAt(0)
  );

// Built-in streams work in browsers and on the server, so no compression library is needed
const pipe = async (
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream
) =>
  new Uint8Array(
    await new Response(
      new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
    ).arrayBuffer()
  );

const toCardState = (
  gridSize: unknown,
  options: unknown,
  includeFreeSpace: unknown,
  themeKey: unknown
): CardState | null => {
  if (typeof gridSize !== "number" || !Number.isInteger(gridSize)) return null;
  if (gridSize < 2 || gridSize > 10) return null;
  if (
    !Array.isArray(options) ||
    options.length > MAX_OPTIONS ||
    !options.every((o) => typeof o === "string" && o.length <= MAX_OPTION_LENGTH)
  ) {
    return null;
  }

  return {
    gridSize,
    options,
    includeFreeSpace: includeFreeSpace === true,
    themeKey: isThemeKey(themeKey) ? themeKey : "classicBingo",
  };
};

// Deflate-compressed compact JSON in URL-safe base64, used as /c/<encoded>
export const encodeCard = async (card: CardState) => {
  const json = JSON.stringify({
    g: card.gridSize,
    o: card.options,
    f: card.includeFreeSpace,
    t: card.themeKey,
  });
  const compressed = await pipe(
    new TextEncoder().encode(json),
    new CompressionStream("deflate")
  );
  return toBase64Url(compressed);
};

export const decodeCard = async (encoded: string): Promise<CardState | null> => {
  if (encoded.length > MAX_ENCODED_LENGTH) return null;
  try {
    const json = new TextDecoder().decode(
      await pipe(fromBase64Url(encoded), new DecompressionStream("deflate"))
    );
    const { g, o, f, t } = JSON.parse(json);
    return toCardState(g, o, f, t);
  } catch {
    return null;
  }
};

// Links shared before /c/ existed: /?s=<base64 of encodeURIComponent(JSON)>
export const decodeLegacyCard = (encoded: string): CardState | null => {
  if (encoded.length > MAX_ENCODED_LENGTH * 2) return null;
  try {
    // Query parsing turns "+" into a space, which broke some of these links
    const raw = JSON.parse(decodeURIComponent(atob(encoded.replace(/ /g, "+"))));
    return toCardState(
      raw.gridSize,
      raw.options,
      raw.includeFreeSpace,
      themeKeyFromName(raw.boardTheme?.themeName)
    );
  } catch {
    return null;
  }
};
