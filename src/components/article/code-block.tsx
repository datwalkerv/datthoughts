"use client";

import { useRef, useState, type ComponentProps } from "react";

type Props = ComponentProps<"pre"> & { "data-language"?: string };

export function CodeBlock({ children, ...props }: Props) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard unavailable (insecure context); fail quietly. */
    }
  }

  return (
    <div className="group relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-2.5 font-mono text-[0.6875rem] text-faint">
        <span aria-hidden />
        <button
          type="button"
          onClick={copy}
          className="pointer-events-auto -mr-2 min-h-8 rounded-md bg-surface px-2 font-sans text-[0.75rem] opacity-100 transition-colors hover:text-ink focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre ref={ref} {...props} style={props.style}>
        {children}
      </pre>
    </div>
  );
}
