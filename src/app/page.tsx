"use client";

import { useState, useEffect } from "react";
import CardMaker from "./components/CardMaker";
import BingoCard from "./components/Bingo";
import { decodeState } from "./utils/url-helpers";

export default function BingoHome() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const encodedState = searchParams.get("s");
  const decodedState = encodedState ? decodeState(encodedState) : null;

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
