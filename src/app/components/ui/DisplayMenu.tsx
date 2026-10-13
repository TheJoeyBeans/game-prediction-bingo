"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Button from "./Button";
import { SlidersIcon } from "./icons";

// A "Display" button that opens a small panel of settings; closes on outside click or Escape
const DisplayMenu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!container.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <Button
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <SlidersIcon />
        <span className="sr-only sm:not-sr-only">Display</span>
      </Button>
      {open && (
        <div
          id={panelId}
          className="absolute top-full right-0 z-40 mt-2 w-64 space-y-4 rounded-xl bg-ink-800 p-4 shadow-2xl ring-1 ring-white/10"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DisplayMenu;
