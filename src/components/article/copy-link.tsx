"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function CopyLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard unavailable (insecure context); fail quietly. */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="meta relative inline-flex h-8 items-center overflow-hidden rounded-full border border-line px-3.5 transition-colors duration-200 hover:border-line-strong hover:text-ink"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "copied" : "copy"}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          {copied ? "Link copied" : "Copy link"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
