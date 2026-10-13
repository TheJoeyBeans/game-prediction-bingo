import { useEffect, useRef, useState, type PointerEvent } from "react";

// How far the mouse must move before a press becomes a drag rather than a click
const DRAG_THRESHOLD_PX = 6;

export interface SwapDrag {
  from: number;
  over: number | null;
  x: number;
  y: number;
}

// Index of the prediction under a point, from the data-swap-index on list pills and board squares
const swapIndexAt = (x: number, y: number) => {
  const target = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>("[data-swap-index]");
  return target ? Number(target.dataset.swapIndex) : null;
};

// Swapping predictions, shared by the list and the preview board. Tap or click one, then another,
// to swap them. A mouse can also drag one onto another; touch only taps, so the page still scrolls
export const useSwap = (count: number, onSwap: (a: number, b: number) => void) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [drag, setDrag] = useState<SwapDrag | null>(null);
  const press = useRef<{ from: number; x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const suppressClick = useRef(false);
  const onSwapRef = useRef(onSwap);
  onSwapRef.current = onSwap;

  // Drop a pick that no longer points at a prediction
  const activePick = picked !== null && picked < count ? picked : null;

  useEffect(() => {
    if (activePick === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePick]);

  useEffect(() => {
    const handleMove = (e: globalThis.PointerEvent) => {
      const start = press.current;
      if (!start) return;
      if (!dragging.current) {
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < DRAG_THRESHOLD_PX) {
          return;
        }
        dragging.current = true;
        setPicked(null);
        document.body.style.cursor = "grabbing";
      }
      setDrag({
        from: start.from,
        over: swapIndexAt(e.clientX, e.clientY),
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleUp = (e: globalThis.PointerEvent) => {
      const start = press.current;
      press.current = null;
      if (!start || !dragging.current) return;

      dragging.current = false;
      document.body.style.cursor = "";
      const target = swapIndexAt(e.clientX, e.clientY);
      if (target !== null && target !== start.from) onSwapRef.current(start.from, target);
      setDrag(null);
      // The click that follows this release shouldn't also count as a pick
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false));
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  const pick = (index: number) => {
    if (suppressClick.current) return;
    if (activePick === null) return setPicked(index);
    if (activePick !== index) onSwap(activePick, index);
    setPicked(null);
  };

  const startDrag = (index: number) => (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    press.current = { from: index, x: e.clientX, y: e.clientY };
  };

  return {
    picked: activePick,
    drag,
    pick,
    startDrag,
    cancel: () => setPicked(null),
  };
};

export type Swap = ReturnType<typeof useSwap>;
