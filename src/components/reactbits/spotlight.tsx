"use client";

/**
 * Spotlight — adapted from React Bits SpotlightCard (https://reactbits.dev/components/spotlight-card).
 * Changes: no card chrome (the host decides border/padding), the cursor
 * position lives in CSS variables instead of React state (no re-render per
 * mouse move), and the default light is a faint monochrome wash.
 */
import { useRef, type ReactNode } from "react";

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}

export default function Spotlight({
  children,
  className = "",
  color = "rgba(255, 255, 255, 0.05)",
  size = 360,
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={`group/spot relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 ease-[var(--ease-out-soft)] group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(${size}px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${color}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
