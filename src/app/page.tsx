"use client";

import CardMaker from "./components/CardMaker";
import BingoCard from "./components/Bingo";
import { decodeState } from "./utils/url-helpers";

export default function BingoHome() {
  if (typeof window === "undefined") {
    return <div>Loading...</div>;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const encodedState = searchParams.get("s");
  const decodedState = encodedState ? decodeState(encodedState) : null;
  console.log("Decoded state:", decodedState);

  if (decodedState) {
    return (
      <>
        <BingoCard
          gridSize={decodedState.gridSize}
          theme={decodedState.boardTheme}
          includeFreeSpace={decodedState.includeFreeSpace}
          options={decodedState.options}
          cardUrl={window.location.href}
        />
      </>
    );
  }
  return (
    <>
      <CardMaker />
    </>
  );
}
