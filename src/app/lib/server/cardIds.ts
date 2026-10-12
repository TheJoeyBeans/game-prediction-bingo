import type { CardState } from "../../utils/url-helpers";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const ID_LENGTH = 8;
// 248 is the largest multiple of 62 below 256; skipping higher bytes keeps every character equally likely
const MAX_UNBIASED_BYTE = 248;

export const CARD_ID_PATTERN = /^[0-9A-Za-z]{8}$/;

// 62^8 ≈ 2.2 × 10^14 possible ids, so they can't be guessed and rarely collide
export const generateCardId = () => {
  let id = "";
  while (id.length < ID_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(ID_LENGTH * 2))) {
      if (byte < MAX_UNBIASED_BYTE && id.length < ID_LENGTH) {
        id += ALPHABET[byte % ALPHABET.length];
      }
    }
  }
  return id;
};

export const sha256Hex = async (text: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

// Fixed key order so identical cards always hash the same; option order counts as a difference
export const hashCard = (card: CardState) =>
  sha256Hex(
    JSON.stringify({
      g: card.gridSize,
      o: card.options,
      f: card.includeFreeSpace,
      t: card.themeKey,
    })
  );
