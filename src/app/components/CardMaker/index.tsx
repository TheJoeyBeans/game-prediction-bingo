"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";
import PreviewBoard from "./PreviewBoard";
import Options from "./Options";
import ThemePicker from "./ThemePicker";
import StepPanel from "./StepPanel";
import { useSwap } from "./useSwap";
import Backdrop from "../ui/Backdrop";
import Button from "../ui/Button";
import SegmentedControl from "../ui/SegmentedControl";
import Toggle from "../ui/Toggle";
import Wordmark from "../ui/Wordmark";
import { ArrowRightIcon } from "../ui/icons";
import { useConsent } from "../CookieConsent";
import { KOFI_URL, THEMES, type ThemeKey } from "../../lib/constants";
import { themedButtonStyle } from "../../lib/themeStyles";
import { encodeCard } from "../../utils/url-helpers";

const CREATE_TIMEOUT_MS = 5000;

const GRID_SIZES = [3, 5, 7].map((size) => ({
  value: size,
  label: `${size} × ${size}`,
}));

interface CardMakerProps {
  heading?: string;
  intro?: string;
  initialThemeKey?: ThemeKey;
  // Event landing pages offer ready-made predictions for their show
  starter?: { eventName: string; predictions: string[] };
  // Page content shown below the card maker
  children?: ReactNode;
}

const CardMaker = ({
  heading = "Prediction bingo for every showcase",
  intro = "Make a bingo card for Nintendo Direct, PlayStation State of Play, Xbox Games Showcase and more. Share it with friends and mark off your predictions as the show plays out live.",
  initialThemeKey = "classicBingo",
  starter,
  children,
}: CardMakerProps) => {
  const router = useRouter();
  const { openCookieSettings } = useConsent();
  const [includeFreeSpace, setIncludeFreeSpace] = useState(true);
  const [themeKey, setThemeKey] = useState<ThemeKey>(initialThemeKey);
  const [gridSize, setGridSize] = useState(5);
  const [options, setOptions] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const swap = useSwap(options.length, (a, b) =>
    setOptions((current) => {
      const next = [...current];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    })
  );
  // Any other change shifts positions, so a pending pick no longer points where it did
  const updateOptions = (next: string[]) => {
    swap.cancel();
    setOptions(next);
  };
  const totalCells = gridSize * gridSize;
  const needed = includeFreeSpace ? totalCells - 1 : totalCells;
  const ready = options.length >= needed;

  const handleGenerateCard = async () => {
    if (creating) return;
    setCreating(true);
    sendGTMEvent({
      event: "generate_card",
      theme: THEMES[themeKey].themeName,
      grid_size: gridSize,
      free_space: includeFreeSpace,
      option_count: options.length,
    });
    const card = { includeFreeSpace, themeKey, gridSize, options };

    let fallbackReason: string;
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
        signal: AbortSignal.timeout(CREATE_TIMEOUT_MS),
      });
      if (res.ok) {
        const { id } = await res.json();
        router.push(`/s/${id}`);
        return;
      }
      fallbackReason = res.status === 429 ? "rate_limited" : `http_${res.status}`;
    } catch (err) {
      fallbackReason =
        err instanceof DOMException && err.name === "TimeoutError"
          ? "timeout"
          : "network";
    }

    // Short links are an extra: if saving fails, the card still works as a long link
    sendGTMEvent({ event: "card_link_fallback", reason: fallbackReason });
    router.push(`/c/${await encodeCard(card)}`);
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ "--event": THEMES[themeKey].accentColor } as CSSProperties}
    >
      <Backdrop />

      <header className="mx-auto flex w-full max-w-7xl items-center px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Video Game Bingo home">
          <Wordmark className="text-lg" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 sm:px-6 lg:px-8">
        <section className="max-w-3xl py-6 sm:py-10">
          <h1 className="bg-linear-to-br from-white to-mist-300 bg-clip-text font-display text-[clamp(2.25rem,4vw+1rem,4rem)] leading-[1.05] font-bold tracking-tight text-transparent">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-mist-300 sm:text-lg">
            {intro}
          </p>
        </section>

        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-4 sm:space-y-6">
            <StepPanel step={1} title="Pick your event">
              <ThemePicker selected={themeKey} onChange={setThemeKey} />
            </StepPanel>

            <StepPanel step={2} title="Choose a board size">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SegmentedControl
                  label="Board size"
                  value={gridSize}
                  options={GRID_SIZES}
                  onChange={setGridSize}
                />
                <Toggle
                  label="Free space in the middle"
                  checked={includeFreeSpace}
                  onChange={setIncludeFreeSpace}
                />
              </div>
            </StepPanel>

            <StepPanel
              step={3}
              title="Add your predictions"
              aside={
                <span className="font-display text-sm font-semibold text-mist-300 tabular-nums">
                  {options.length} / {needed}
                </span>
              }
            >
              <Options
                options={options}
                setOptions={updateOptions}
                needed={needed}
                starter={starter}
                swap={swap}
              />
            </StepPanel>
          </div>

          <div className="lg:sticky lg:top-6">
            <PreviewBoard
              gridSize={gridSize}
              options={options}
              includeFreeSpace={includeFreeSpace}
              themeKey={themeKey}
              swap={swap}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!ready || creating}
                onClick={handleGenerateCard}
                style={
                  ready && !creating
                    ? themedButtonStyle(THEMES[themeKey])
                    : undefined
                }
              >
                {creating ? (
                  "Creating…"
                ) : (
                  <>
                    Create my card <ArrowRightIcon />
                  </>
                )}
              </Button>
              {!ready && (
                <p className="mt-3 text-center text-sm text-mist-500">
                  Add {needed - options.length} more{" "}
                  {needed - options.length === 1 ? "prediction" : "predictions"}{" "}
                  to create your card.
                </p>
              )}
            </PreviewBoard>
          </div>
        </div>

        {children}
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-mist-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          Fan-made and not affiliated with Nintendo, Sony or Microsoft.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendGTMEvent({ event: "support_click" })}
            className="underline-offset-4 hover:text-mist-300 hover:underline"
          >
            Support on Ko-fi
          </a>
          <button
            type="button"
            onClick={openCookieSettings}
            className="cursor-pointer underline-offset-4 hover:text-mist-300 hover:underline"
          >
            Cookie settings
          </button>
        </div>
      </footer>

      {swap.drag && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 max-w-60 truncate rounded-lg bg-ink-700 px-3 py-1.5 text-sm text-mist-100 shadow-xl ring-1 ring-white/20"
          style={{ left: swap.drag.x + 14, top: swap.drag.y + 14 }}
        >
          {options[swap.drag.from]}
        </div>
      )}
    </div>
  );
};

export default CardMaker;
