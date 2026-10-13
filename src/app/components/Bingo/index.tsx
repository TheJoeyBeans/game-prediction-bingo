"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import Board from "../Board";
import Confetti from "../Confetti";
import Backdrop from "../ui/Backdrop";
import Button, { buttonStyles } from "../ui/Button";
import DisplayMenu from "../ui/DisplayMenu";
import Toggle from "../ui/Toggle";
import Wordmark from "../ui/Wordmark";
import {
  ArrowLeftIcon,
  CheckIcon,
  ShareIcon,
  ShuffleIcon,
} from "../ui/icons";
import { THEMES } from "../../lib/constants";
import { useColorMode } from "../../lib/colorMode";
import { readPreference, savePreference } from "../../lib/preferences";
import { themedButtonStyle } from "../../lib/themeStyles";
import { PLATFORM_LOGOS } from "../../utils/logos";
import {
  boardSlots,
  cellToOption,
  completedLines,
  isFreeCell,
  optionToCell,
} from "../../utils/boardLayout";
import { shuffleBoard } from "../../utils/shuffleBoard";
import type { CardState } from "../../utils/url-helpers";

const SHARE_LABELS = {
  idle: "Share this card",
  copied: "Link copied!",
  failed: "Couldn't copy. Use the address bar link.",
};

const SOFT_COLORS_KEY = "soft-colors";

const BingoCard = ({ card }: { card: CardState }) => {
  const { gridSize, includeFreeSpace, themeKey } = card;
  const [streamMode, setStreamMode] = useState(false);
  const [softColors, setSoftColors] = useState(false);
  const [colorMode, changeColorMode] = useColorMode();
  const [selected, setSelected] = useState(() => new Set<number>());
  const [options, setOptions] = useState(card.options);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );
  const theme = THEMES[themeKey];
  const platformLogo = PLATFORM_LOGOS[themeKey];
  const bingoLines = useMemo(
    () => completedLines(gridSize, includeFreeSpace, selected),
    [gridSize, includeFreeSpace, selected]
  );
  const [confettiBurst, setConfettiBurst] = useState(0);
  // Lines already celebrated, so only a newly completed line sets off confetti
  const celebratedLines = useRef(0);
  // Hidden controls keep their space so the board doesn't jump in stream mode
  const controlsVisibility = streamMode ? "invisible" : "";

  useEffect(() => {
    if (bingoLines.length > celebratedLines.current) {
      sendGTMEvent({ event: "bingo", lines: bingoLines.length });
      setConfettiBurst((burst) => burst + 1);
    }
    celebratedLines.current = bingoLines.length;
  }, [bingoLines.length]);

  // Read after mounting, since the server can't know this browser's preference
  useEffect(() => {
    setSoftColors(readPreference(SOFT_COLORS_KEY) === "on");
  }, []);

  useEffect(() => {
    if (shareStatus === "idle") return;
    const timer = setTimeout(() => setShareStatus("idle"), 3000);
    return () => clearTimeout(timer);
  }, [shareStatus]);

  // Marks stay with their predictions, and marked predictions stay on the board,
  // so only unmarked ones trade places with the extras
  const handleShuffleBoard = () => {
    sendGTMEvent({ event: "shuffle_board" });
    const slots = boardSlots(gridSize, includeFreeSpace);
    const markedOptions = [...selected]
      .filter((cell) => !isFreeCell(cell, gridSize, includeFreeSpace))
      .map((cell) => cellToOption(cell, gridSize, includeFreeSpace));
    const unmarked = shuffleBoard(
      options.map((_, i) => i).filter((i) => !markedOptions.includes(i))
    );
    const unmarkedOnBoard = slots - markedOptions.length;
    // New order, as indexes into the old order
    const order = [
      ...shuffleBoard([...markedOptions, ...unmarked.slice(0, unmarkedOnBoard)]),
      ...unmarked.slice(unmarkedOnBoard),
    ];
    const newCell = new Map(
      order.map((oldOption, position) => [
        oldOption,
        optionToCell(position, gridSize, includeFreeSpace),
      ])
    );

    const nextSelected = new Set(
      [...selected].map((cell) =>
        isFreeCell(cell, gridSize, includeFreeSpace)
          ? cell
          : newCell.get(cellToOption(cell, gridSize, includeFreeSpace))!
      )
    );
    // A shuffle can line marks up by chance; that shouldn't count as a new bingo
    celebratedLines.current = completedLines(
      gridSize,
      includeFreeSpace,
      nextSelected
    ).length;

    setOptions(order.map((i) => options[i]));
    setSelected(nextSelected);
  };

  const handleStreamModeChange = (enabled: boolean) => {
    sendGTMEvent({ event: "stream_mode_toggle", enabled });
    setStreamMode(enabled);
  };

  const handleSoftColorsChange = (enabled: boolean) => {
    sendGTMEvent({ event: "soft_colors_toggle", enabled });
    setSoftColors(enabled);
    savePreference(SOFT_COLORS_KEY, enabled ? "on" : null);
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    // Long links mean the short link couldn't be saved when the card was made
    const trackShare = (method: "native" | "copy", outcome: string) =>
      sendGTMEvent({
        event: "share_card",
        method,
        outcome,
        link_type: window.location.pathname.startsWith("/s/") ? "short" : "long",
      });

    // Phones and tablets get the native share sheet; desktops copy the link
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: "My video game bingo card", url });
        trackShare("native", "shared");
      } catch (err) {
        trackShare(
          "native",
          err instanceof DOMException && err.name === "AbortError"
            ? "dismissed"
            : "failed"
        );
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      trackShare("copy", "copied");
    } catch {
      setShareStatus("failed");
      trackShare("copy", "failed");
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
      <Backdrop glow={!softColors} />

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
            <div
              className={`max-w-full overflow-hidden rounded-xl shadow-lg ${
                platformLogo.hasBackground ? "" : "bg-white px-4 py-2 sm:px-6"
              }`}
            >
              <Image
                src={platformLogo.image}
                alt={`${theme.themeName} logo`}
                width={700}
                className={`h-auto w-auto max-w-full ${
                  platformLogo.hasBackground
                    ? "max-h-15 sm:max-h-18 lg:max-h-20"
                    : "max-h-9 sm:max-h-12 lg:max-h-14"
                }`}
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
          <DisplayMenu>
            <Toggle
              label="Stream mode"
              className="flex w-full justify-between"
              checked={streamMode}
              onChange={handleStreamModeChange}
            />
            <Toggle
              label="Soft colors"
              className="flex w-full justify-between"
              checked={softColors}
              onChange={handleSoftColorsChange}
            />
            <Toggle
              label="Light mode"
              className="flex w-full justify-between"
              checked={colorMode === "light"}
              onChange={(light) => changeColorMode(light ? "light" : "dark")}
            />
          </DisplayMenu>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-3 py-2 sm:px-6">
        <Board
          soft={softColors}
          bingoLines={bingoLines}
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
          style={themedButtonStyle(theme)}
        >
          {shareStatus === "copied" ? <CheckIcon /> : <ShareIcon />}
          {SHARE_LABELS[shareStatus]}
        </Button>
      </footer>

      <Confetti
        burst={confettiBurst}
        colors={[
          theme.accentColor,
          theme.markerColor,
          theme.textColor,
          theme.backgroundColor,
        ]}
      />
      <p className="sr-only" aria-live="polite">
        {bingoLines.length > 0 &&
          `Bingo! ${bingoLines.length} ${bingoLines.length === 1 ? "line" : "lines"} complete.`}
      </p>
    </div>
  );
};

export default BingoCard;
