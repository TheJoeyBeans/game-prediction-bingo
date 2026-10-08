"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import Board from "../Board";
import Backdrop from "../ui/Backdrop";
import Button, { buttonStyles } from "../ui/Button";
import Toggle from "../ui/Toggle";
import Wordmark from "../ui/Wordmark";
import {
  ArrowLeftIcon,
  CheckIcon,
  ShareIcon,
  ShuffleIcon,
} from "../ui/icons";
import { THEMES } from "../../lib/constants";
import { PLATFORM_LOGOS } from "../../utils/logos";
import { shuffleBoard } from "../../utils/shuffleBoard";
import type { CardState } from "../../utils/url-helpers";

const SHARE_LABELS = {
  idle: "Share this card",
  copied: "Link copied!",
  failed: "Couldn't copy. Use the address bar link.",
};

const BingoCard = ({ card }: { card: CardState }) => {
  const { gridSize, includeFreeSpace, themeKey } = card;
  const [streamMode, setStreamMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set<number>());
  const [options, setOptions] = useState(card.options);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );
  const theme = THEMES[themeKey];
  const platformLogo = PLATFORM_LOGOS[themeKey];
  // Hidden controls keep their space so the board doesn't jump in stream mode
  const controlsVisibility = streamMode ? "invisible" : "";

  useEffect(() => {
    if (shareStatus === "idle") return;
    const timer = setTimeout(() => setShareStatus("idle"), 3000);
    return () => clearTimeout(timer);
  }, [shareStatus]);

  const handleShuffleBoard = () => {
    setSelected(new Set());
    setOptions(shuffleBoard([...options]));
  };

  const handleShareClick = async () => {
    sendGTMEvent({ event: "share_card" });
    const url = window.location.href;

    // Phones and tablets get the native share sheet; desktops copy the link
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: "My video game bingo card", url });
      } catch {
        // Share sheet dismissed
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }
  };

  const handleCellClick = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ "--event": theme.accentColor } as CSSProperties}
    >
      <Backdrop />

      {/* Side columns share the leftover space, so the logo stays centered and never overlaps the controls */}
      <header className="grid grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-3 p-3 sm:p-5">
        <div
          className={`flex flex-col items-start gap-2 sm:flex-row ${controlsVisibility}`}
        >
          <Link href="/" className={buttonStyles("secondary", "sm")}>
            <ArrowLeftIcon />
            <span className="sr-only sm:not-sr-only">New card</span>
          </Link>
          <Button size="sm" onClick={handleShuffleBoard}>
            <ShuffleIcon />
            <span className="sr-only sm:not-sr-only">Shuffle</span>
          </Button>
        </div>

        <div className="flex justify-center">
          {platformLogo ? (
            <div className="max-w-full rounded-xl bg-white px-4 py-2 shadow-lg sm:px-6">
              <Image
                src={platformLogo}
                alt={`${theme.themeName} logo`}
                width={700}
                className="h-auto max-h-9 w-auto max-w-full sm:max-h-12 lg:max-h-14"
              />
            </div>
          ) : (
            <Wordmark className="text-base sm:text-xl" />
          )}
        </div>

        <div
          className={`flex justify-end transition-opacity duration-200 ${
            streamMode
              ? "opacity-30 focus-within:opacity-100 hover:opacity-100"
              : ""
          }`}
        >
          <Toggle
            label="Stream mode"
            labelClassName={streamMode ? "sr-only" : "sr-only sm:not-sr-only"}
            checked={streamMode}
            onChange={setStreamMode}
          />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-3 py-2 sm:px-6">
        <Board
          gridSize={gridSize}
          options={options}
          includeFreeSpace={includeFreeSpace}
          themeKey={themeKey}
          selected={selected}
          onCellClick={handleCellClick}
          fitViewport
        />
      </main>

      <footer className="flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
        <Button
          variant="primary"
          size="lg"
          onClick={handleShareClick}
          aria-live="polite"
          className={controlsVisibility}
        >
          {shareStatus === "copied" ? <CheckIcon /> : <ShareIcon />}
          {SHARE_LABELS[shareStatus]}
        </Button>
      </footer>
    </div>
  );
};

export default BingoCard;
