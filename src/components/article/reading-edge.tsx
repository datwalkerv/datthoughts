"use client";

import { useEffect, useState } from "react";
import GradualBlur from "@/components/reactbits/gradual-blur";

/**
 * A soft blur along the bottom of the viewport while reading. It fades away
 * once the site footer scrolls into view, so the footer is never obscured.
 */
export function ReadingEdge() {
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setAtEnd(entry.isIntersecting), {
      rootMargin: "0px 0px 80px 0px",
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20 transition-opacity duration-500 ease-[var(--ease-out-soft)] ${atEnd ? "opacity-0" : "opacity-100"}`}
    >
      <GradualBlur target="parent" position="bottom" height="5rem" strength={1.5} divCount={5} curve="bezier" exponential opacity={1} />
    </div>
  );
}
