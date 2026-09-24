"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | undefined>(undefined);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = ids.find((id) => visible.has(id));
        if (first) {
          setActive(first);
          return;
        }
        // Nothing in the band: keep the last heading scrolled past.
        const above = elements.filter((el) => el.getBoundingClientRect().top < 0);
        setActive(above.at(-1)?.id);
      },
      { rootMargin: "-10% 0px -65% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function TocList({ headings, active }: { headings: Heading[]; active?: string }) {
  return (
    <ol className="space-y-0.5 text-[0.8125rem] leading-snug">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            aria-current={active === h.id ? "location" : undefined}
            className={`block py-1.5 text-faint transition-colors duration-300 hover:text-ink-soft aria-[current]:text-ink ${h.depth === 3 ? "pl-3" : ""}`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Sticky rail beside the column on wide screens. */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const active = useActiveHeading(headings.map((h) => h.id));
  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 -mx-4 -mt-3 rounded-xl border border-line/60 bg-bg/70 px-4 pt-3 pb-2 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl backdrop-saturate-150"
    >
      <p className="meta mb-2 text-muted">On this page</p>
      <TocList headings={headings} active={active} />
    </nav>
  );
}

/** Disclosure above the body on smaller screens. */
export function InlineTableOfContents({ headings }: { headings: Heading[] }) {
  return (
    <details className="group mb-12 border-y border-line">
      <summary className="meta flex min-h-12 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        On this page
        <span aria-hidden className="text-faint transition-transform duration-300 group-open:rotate-180">
          ↓
        </span>
      </summary>
      <nav aria-label="On this page" className="pb-4">
        <TocList headings={headings} />
      </nav>
    </details>
  );
}
