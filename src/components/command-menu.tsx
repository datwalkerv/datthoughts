"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export interface SearchItem {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
}

interface Result {
  id: string;
  href: string;
  title: string;
  hint: string;
  detail?: string;
  external?: boolean;
}

const pages: Result[] = [
  { id: "page-archive", href: "/", title: "Archive", hint: "Page" },
  { id: "page-topics", href: "/tags", title: "Topics", hint: "Page" },
  { id: "page-rss", href: "/feed.xml", title: "RSS feed", hint: "Page", external: true },
];

const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function score(item: SearchItem, terms: string[]): number {
  const title = item.title.toLowerCase();
  const rest = `${item.excerpt} ${item.tags.join(" ")}`.toLowerCase();
  let total = 0;
  for (const term of terms) {
    if (title.startsWith(term)) total += 4;
    else if (title.includes(term)) total += 3;
    else if (item.tags.some((t) => t.toLowerCase().startsWith(term))) total += 2;
    else if (rest.includes(term)) total += 1;
    else return 0;
  }
  return total;
}

const noop = () => () => {};

/** "⌘" on Apple platforms, "Ctrl" elsewhere; "⌘" during SSR and hydration. */
function useModifierKey() {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}

export function CommandMenu({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const modifier = useModifierKey();
  // False during SSR and hydration, so the portal only mounts afterwards.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const listboxId = useId();

  const groups = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const thoughts = (
      terms.length === 0
        ? items.slice(0, 6)
        : items
            .map((item) => ({ item, s: score(item, terms) }))
            .filter((r) => r.s > 0)
            .sort((a, b) => b.s - a.s)
            .map((r) => r.item)
    ).map<Result>((item) => ({
      id: `thought-${item.slug}`,
      href: `/${item.slug}`,
      title: item.title,
      hint: dateLabel.format(new Date(item.date)),
      detail: item.excerpt,
    }));
    const matchingPages =
      terms.length === 0 ? pages : pages.filter((p) => terms.every((t) => p.title.toLowerCase().includes(t)));
    return [
      { label: terms.length === 0 ? "Recent thoughts" : "Thoughts", results: thoughts },
      { label: "Pages", results: matchingPages },
    ].filter((g) => g.results.length > 0);
  }, [items, query]);

  const flat = useMemo(() => groups.flatMap((g) => g.results), [groups]);
  const activeResult = flat[Math.min(active, flat.length - 1)];

  const show = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    returnFocusRef.current?.focus?.();
  }, []);

  const go = useCallback(
    (result: Result) => {
      setOpen(false);
      if (result.external) window.location.href = result.href;
      else router.push(result.href);
    },
    [router],
  );

  // Global shortcuts: ⌘K / Ctrl+K toggles, "/" opens when not typing.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) hide();
        else show();
        return;
      }
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (e.key === "/" && !open && !typing) {
        e.preventDefault();
        show();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, show, hide]);

  // Lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Keep the active option in view.
  useEffect(() => {
    if (!activeResult) return;
    listRef.current
      ?.querySelector(`[data-id="${activeResult.id}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeResult]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter" && activeResult) {
      e.preventDefault();
      go(activeResult);
    } else if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "Tab") {
      // The dialog has a single focus stop; keep focus inside it.
      e.preventDefault();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        className="group hidden h-8 w-56 items-center justify-between rounded-lg border border-line bg-surface/60 pr-1.5 pl-3 text-[0.8125rem] text-faint shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-200 hover:border-line-strong hover:text-muted sm:flex"
      >
        Search thoughts…
        <span className="flex gap-0.5">
          <kbd className="kbd">{modifier}</kbd>
          <kbd className="kbd">K</kbd>
        </span>
      </button>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        className="flex min-h-11 items-center px-3 text-[0.8125rem] text-muted transition-colors hover:text-ink sm:hidden"
      >
        Search
      </button>

      {/* Portaled: the header's backdrop-filter would otherwise trap `position: fixed`. */}
      {mounted &&
        createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div aria-hidden className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={hide} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search thoughts"
              className="relative w-full max-w-[38rem] overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_32px_96px_-16px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)]"
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-14 items-center gap-3 border-b border-line px-5">
                <input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search thoughts…"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listboxId}
                  aria-activedescendant={activeResult?.id}
                  aria-autocomplete="list"
                  spellCheck={false}
                  className="h-full flex-1 bg-transparent text-[0.9375rem] text-ink placeholder:text-faint focus:outline-none"
                />
                <kbd className="kbd">Esc</kbd>
              </div>

              <ul ref={listRef} id={listboxId} role="listbox" className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
                {flat.length === 0 && (
                  <li className="px-3 py-10 text-center text-[0.875rem] text-muted">
                    Nothing matches “{query}”.
                  </li>
                )}
                {groups.map((group) => (
                  <li key={group.label} role="presentation">
                    <p className="meta px-3 pt-3 pb-1.5 text-[0.75rem] text-faint">{group.label}</p>
                    <ul role="presentation">
                      {group.results.map((result) => {
                        const selected = result.id === activeResult?.id;
                        return (
                          <li
                            key={result.id}
                            id={result.id}
                            data-id={result.id}
                            role="option"
                            aria-selected={selected}
                            onPointerMove={() => setActive(flat.indexOf(result))}
                            onClick={() => go(result)}
                            className={`flex cursor-pointer items-baseline justify-between gap-6 rounded-lg px-3 py-2.5 transition-colors duration-150 ${selected ? "bg-raised" : ""}`}
                          >
                            <span className="min-w-0">
                              <span className={`block truncate text-[0.9375rem] ${selected ? "text-ink" : "text-ink-soft"}`}>
                                {result.title}
                              </span>
                              {result.detail && (
                                <span className="mt-0.5 block truncate text-[0.8125rem] text-faint">{result.detail}</span>
                              )}
                            </span>
                            <span className="meta shrink-0 text-[0.75rem] text-faint">{result.hint}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 border-t border-line px-5 py-3 text-[0.75rem] text-faint">
                <span className="flex items-center gap-1.5">
                  <kbd className="kbd">↑</kbd>
                  <kbd className="kbd">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="kbd">↵</kbd>
                  open
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
