import {
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import Button from "../../ui/Button";
import { CloseIcon, EditIcon, PlusIcon, ShuffleIcon } from "../../ui/icons";
import { shuffleBoard } from "../../../utils/shuffleBoard";
import { SAMPLE_OPTIONS } from "../../../lib/sampleOptions";
import type { Swap } from "../useSwap";

// Same cap the server applies, so a card never fails to save over one long prediction
const MAX_PREDICTION_LENGTH = 200;

interface OptionsProps {
  options: string[];
  setOptions: (options: string[]) => void;
  needed: number;
  starter?: { eventName: string; predictions: string[] };
  swap: Swap;
}

const Options = ({ options, setOptions, needed, starter, swap }: OptionsProps) => {
  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const count = options.length;
  const extra = count - needed;
  // Starter predictions not on the card yet, so the offer disappears once they're all added
  const missingStarter =
    starter?.predictions.filter((prediction) => !options.includes(prediction)) ??
    [];

  const handleUseStarter = () => {
    if (!starter) return;
    sendGTMEvent({ event: "use_starter_predictions", theme: starter.eventName });
    setOptions([...options, ...missingStarter]);
  };

  const addOptions = (values: string[]) => {
    const cleaned = values
      .map((value) => value.trim().slice(0, MAX_PREDICTION_LENGTH))
      .filter(Boolean);
    if (cleaned.length) setOptions([...options, ...cleaned]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addOptions([inputValue]);
    setInputValue("");
  };

  // Pasting several lines adds one prediction per line
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\n")) return;
    e.preventDefault();
    addOptions(text.split(/\r?\n/));
  };

  const handleDeleteOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // Saving empty text removes the prediction
  const saveEdit = (index: number, value: string) => {
    setEditing(null);
    const text = value.trim();
    if (text === options[index]) return;
    setOptions(
      text
        ? options.map((option, i) => (i === index ? text : option))
        : options.filter((_, i) => i !== index)
    );
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(index, e.currentTarget.value);
    } else if (e.key === "Escape") {
      // Don't let Escape also cancel a pick
      e.stopPropagation();
      setEditing(null);
    }
  };

  const status =
    count < needed
      ? `${needed - count} more to fill the board`
      : extra > 0
        ? `Board is full. ${extra} faded ${extra === 1 ? "prediction isn't" : "predictions aren't"} on it yet: tap one, then a square, to swap it in. Shuffle mixes them in too.`
        : "Board is full. You're ready to go!";

  return (
    <div className="space-y-4">
      {starter && missingStarter.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl bg-veil/[0.04] p-3 ring-1 ring-inset ring-veil/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-mist-300">
            {count === 0
              ? `Short on time? Start with ${missingStarter.length} ${starter.eventName} predictions and edit from there.`
              : `Add ${missingStarter.length} more ${starter.eventName} predictions from our list.`}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={handleUseStarter}
          >
            {count === 0 ? "Use these predictions" : "Add them"}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="new-option" className="sr-only">
          New prediction
        </label>
        <input
          id="new-option"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPaste={handlePaste}
          placeholder="e.g. Surprise shadow drop"
          autoComplete="off"
          maxLength={MAX_PREDICTION_LENGTH}
          className="h-11 min-w-0 flex-1 rounded-xl bg-ink-950/60 px-4 text-sm text-mist-100 ring-1 ring-inset ring-veil/10 placeholder:text-mist-500 focus:ring-2 focus:ring-accent-400 focus:outline-none"
        />
        <Button type="submit" variant="secondary" aria-label="Add prediction">
          <PlusIcon className="text-base" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </form>
      <p className="text-xs text-mist-500">
        Tip: paste a list to add one prediction per line.
        {count > 1 &&
          " Tap two predictions, here or on the board, to swap them, or drag one onto another."}
      </p>

      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-veil/10">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${
              count >= needed ? "bg-success" : "bg-accent-500"
            }`}
            style={{ width: `${Math.min(count / needed, 1) * 100}%` }}
          />
        </div>
        <p
          className={`mt-2 text-sm ${
            count >= needed ? "text-success" : "text-mist-300"
          }`}
          aria-live="polite"
        >
          {status}
        </p>
      </div>

      {swap.picked !== null && (
        <p
          className="rounded-lg bg-veil/[0.06] px-3 py-2 text-sm text-mist-100"
          aria-live="polite"
        >
          Swapping &ldquo;{options[swap.picked]}&rdquo;. Tap another
          prediction or a square on the board. Tap it again or press Esc to
          cancel.
        </p>
      )}

      {count > 0 && (
        <ul className="flex flex-wrap gap-2">
          {options.map((option, i) => {
            const isPicked = swap.picked === i;
            const isDropTarget =
              swap.drag !== null && swap.drag.from !== i && swap.drag.over === i;

            return (
              <li
                key={`${i}-${option}`}
                data-swap-index={i}
                className={`inline-flex max-w-full items-center gap-1 rounded-lg py-1 pr-1 pl-1 text-sm ring-inset transition duration-100 ${
                  isPicked
                    ? "bg-ink-600 ring-2 ring-mist-100"
                    : isDropTarget
                      ? "bg-ink-700 ring-2 ring-veil/70"
                      : "bg-ink-800 ring-1 ring-veil/10"
                } ${i >= needed && !isPicked ? "opacity-50" : ""} ${
                  swap.drag?.from === i ? "opacity-40" : ""
                }`}
              >
                {editing === i ? (
                  <input
                    autoFocus
                    defaultValue={option}
                    maxLength={MAX_PREDICTION_LENGTH}
                    aria-label="Edit prediction"
                    onKeyDown={(e) => handleEditKeyDown(e, i)}
                    onBlur={(e) => saveEdit(i, e.currentTarget.value)}
                    className="h-8 w-56 max-w-full min-w-0 rounded-md bg-ink-950/60 px-2 text-sm text-mist-100 ring-2 ring-accent-400 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    aria-pressed={isPicked}
                    onClick={() => swap.pick(i)}
                    onPointerDown={swap.startDrag(i)}
                    className="h-8 min-w-0 cursor-grab truncate rounded-md px-2 text-left select-none"
                  >
                    {option}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(i)}
                  aria-label={`Edit "${option}"`}
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-md text-mist-500 transition-colors hover:bg-veil/10 hover:text-mist-100"
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteOption(i)}
                  aria-label={`Remove "${option}"`}
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-md text-mist-500 transition-colors hover:bg-veil/10 hover:text-mist-100"
                >
                  <CloseIcon />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {count > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOptions(shuffleBoard([...options]))}
          >
            <ShuffleIcon /> Shuffle order
          </Button>
        )}
        {count > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setOptions([])}>
            Clear all
          </Button>
        )}
        {process.env.NODE_ENV === "development" && (
          <Button
            variant="ghost"
            size="sm"
            className="border border-dashed border-veil/20"
            onClick={() =>
              setOptions(shuffleBoard([...SAMPLE_OPTIONS]).slice(0, needed))
            }
          >
            Fill with sample options (dev only)
          </Button>
        )}
      </div>
    </div>
  );
};

export default Options;
