"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";
import PreviewBoard from "./PreviewBoard";
import Options from "./Options";
import ThemePicker from "./ThemePicker";
import StepPanel from "./StepPanel";
import Backdrop from "../ui/Backdrop";
import Button from "../ui/Button";
import SegmentedControl from "../ui/SegmentedControl";
import Toggle from "../ui/Toggle";
import Wordmark from "../ui/Wordmark";
import { ArrowRightIcon } from "../ui/icons";
import { useConsent } from "../CookieConsent";
import { THEMES, type ThemeKey } from "../../lib/constants";
import { encodeCard } from "../../utils/url-helpers";

const GRID_SIZES = [3, 5, 7].map((size) => ({
  value: size,
  label: `${size} × ${size}`,
}));

const CardMaker = () => {
  const router = useRouter();
  const { openCookieSettings } = useConsent();
  const [includeFreeSpace, setIncludeFreeSpace] = useState(true);
  const [themeKey, setThemeKey] = useState<ThemeKey>("classicBingo");
  const [gridSize, setGridSize] = useState(5);
  const [options, setOptions] = useState<string[]>([]);
  const totalCells = gridSize * gridSize;
  const needed = includeFreeSpace ? totalCells - 1 : totalCells;
  const ready = options.length >= needed;

  const handleGenerateCard = async () => {
    sendGTMEvent({
      event: "generate_card",
      theme: THEMES[themeKey].themeName,
    });
    const encoded = await encodeCard({
      includeFreeSpace,
      themeKey,
      gridSize,
      options,
    });
    router.push(`/c/${encoded}`);
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{ "--event": THEMES[themeKey].accentColor } as CSSProperties}
    >
      <Backdrop />

      <header className="mx-auto flex w-full max-w-7xl items-center px-4 py-5 sm:px-6 lg:px-8">
        <Wordmark className="text-lg" />
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 sm:px-6 lg:px-8">
        <section className="max-w-3xl py-6 sm:py-10">
          <h1 className="bg-linear-to-br from-white to-mist-300 bg-clip-text font-display text-[clamp(2.25rem,4vw+1rem,4rem)] leading-[1.05] font-bold tracking-tight text-transparent">
            Prediction bingo for every showcase
          </h1>
          <p className="mt-4 max-w-2xl text-base text-mist-300 sm:text-lg">
            Make a bingo card for Nintendo Direct, PlayStation State of Play,
            Xbox Games Showcase and more. Share it with friends and mark off
            your predictions as the show plays out live.
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
              <Options options={options} setOptions={setOptions} needed={needed} />
            </StepPanel>
          </div>

          <div className="lg:sticky lg:top-6">
            <PreviewBoard
              gridSize={gridSize}
              options={options}
              includeFreeSpace={includeFreeSpace}
              themeKey={themeKey}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!ready}
                onClick={handleGenerateCard}
              >
                Create my card <ArrowRightIcon />
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
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-mist-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          Fan-made and not affiliated with Nintendo, Sony or Microsoft.
        </p>
        <button
          type="button"
          onClick={openCookieSettings}
          className="cursor-pointer underline-offset-4 hover:text-mist-300 hover:underline"
        >
          Cookie settings
        </button>
      </footer>
    </div>
  );
};

export default CardMaker;
