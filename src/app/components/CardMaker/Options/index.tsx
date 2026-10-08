import { useState, type ClipboardEvent, type FormEvent } from "react";
import Button from "../../ui/Button";
import { CloseIcon, PlusIcon, ShuffleIcon } from "../../ui/icons";
import { shuffleBoard } from "../../../utils/shuffleBoard";
import { SAMPLE_OPTIONS } from "../../../lib/sampleOptions";

interface OptionsProps {
  options: string[];
  setOptions: (options: string[]) => void;
  needed: number;
}

const Options = ({ options, setOptions, needed }: OptionsProps) => {
  const [inputValue, setInputValue] = useState("");
  const count = options.length;
  const extra = count - needed;

  const addOptions = (values: string[]) => {
    const cleaned = values.map((value) => value.trim()).filter(Boolean);
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

  const status =
    count < needed
      ? `${needed - count} more to fill the board`
      : extra > 0
        ? `Board is full. ${extra} extra will get mixed in when you shuffle.`
        : "Board is full. You're ready to go!";

  return (
    <div className="space-y-4">
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
          className="h-11 min-w-0 flex-1 rounded-xl bg-ink-950/60 px-4 text-sm text-mist-100 ring-1 ring-inset ring-white/10 placeholder:text-mist-500 focus:ring-2 focus:ring-accent-400 focus:outline-none"
        />
        <Button type="submit" variant="secondary" aria-label="Add prediction">
          <PlusIcon className="text-base" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </form>
      <p className="text-xs text-mist-500">
        Tip: paste a list to add one prediction per line.
      </p>

      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
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

      {count > 0 && (
        <ul className="flex flex-wrap gap-2">
          {options.map((option, i) => (
            <li
              key={`${i}-${option}`}
              className={`inline-flex max-w-full items-center gap-1 rounded-lg bg-ink-800 py-1 pr-1 pl-3 text-sm ring-1 ring-inset ring-white/10 ${
                i >= needed ? "opacity-50" : ""
              }`}
            >
              <span className="truncate">{option}</span>
              <button
                type="button"
                onClick={() => handleDeleteOption(i)}
                aria-label={`Remove "${option}"`}
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-md text-mist-500 transition-colors hover:bg-white/10 hover:text-mist-100"
              >
                <CloseIcon />
              </button>
            </li>
          ))}
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
            className="border border-dashed border-white/20"
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
