import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "../ui/icons";
import { THEMES } from "../../lib/constants";
import { EVENTS } from "../../lib/events";

// Links to every event landing page, so each page is reachable from every other
const EventLinks = ({ exclude }: { exclude?: string }) => (
  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {EVENTS.filter((event) => event.slug !== exclude).map((event) => (
      <li key={event.slug}>
        <Link
          href={`/${event.slug}`}
          style={
            { "--swatch": THEMES[event.themeKey].accentColor } as CSSProperties
          }
          className="group flex h-full items-center justify-between gap-3 rounded-xl bg-ink-900/80 p-4 ring-1 ring-inset ring-veil/10 transition duration-150 hover:ring-(--swatch)"
        >
          <span>
            <span className="block font-display font-semibold text-mist-100">
              {event.name} bingo
            </span>
            <span className="mt-0.5 block text-sm text-mist-500">
              Card maker with starter predictions
            </span>
          </span>
          <ArrowRightIcon className="shrink-0 text-mist-500 transition duration-150 group-hover:translate-x-0.5 group-hover:text-(--swatch)" />
        </Link>
      </li>
    ))}
  </ul>
);

export default EventLinks;
