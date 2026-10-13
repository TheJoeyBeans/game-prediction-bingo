"use client";

import { useEffect, useRef } from "react";

const PIECES = 160;
const DURATION_MS = 3200;
const GRAVITY = 0.35;

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  flip: number;
  color: string;
}

// Fires confetti from both bottom corners each time `burst` increases.
// Skipped when the visitor's system asks for reduced motion
const Confetti = ({ burst, colors }: { burst: number; colors: string[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read when a burst starts, so new color arrays on re-render don't restart the animation
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    if (burst === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const palette = colorsRef.current;
    const pieces: Piece[] = Array.from({ length: PIECES }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? 0 : width,
        y: height * 0.75,
        vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 10),
        vy: -(10 + Math.random() * 11),
        size: 7 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        flip: Math.random() * Math.PI * 2,
        color: palette[i % palette.length],
      };
    });

    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const elapsed = now - start;
      context.clearRect(0, 0, width, height);
      if (elapsed > DURATION_MS) return;

      context.globalAlpha = Math.min(1, 2 * (1 - elapsed / DURATION_MS));
      for (const piece of pieces) {
        piece.vy += GRAVITY;
        piece.vx *= 0.99;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.spin;
        piece.flip += 0.12;

        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        // Squashing one side makes each piece look like it's tumbling
        const tumble = Math.abs(Math.cos(piece.flip));
        context.fillRect(
          -piece.size / 2,
          (-piece.size * tumble) / 4,
          piece.size,
          (piece.size * tumble) / 2 + 1
        );
        context.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
    };
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
};

export default Confetti;
