import Link from "next/link";
import type { ThoughtMeta } from "@/lib/content";

function NavLink({ thought, direction }: { thought: ThoughtMeta; direction: "older" | "newer" }) {
  const older = direction === "older";
  return (
    <Link
      href={`/${thought.slug}`}
      rel={older ? "prev" : "next"}
      className={`group block py-6 ${older ? "" : "sm:text-right"}`}
    >
      <span className="meta">{older ? "Previous" : "Next"}</span>
      <span
        className={`mt-1.5 block text-[1.0625rem] leading-snug font-medium tracking-[-0.015em] text-balance text-ink-soft transition duration-300 ease-[var(--ease-out-soft)] group-hover:text-ink ${older ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
      >
        {thought.title}
      </span>
    </Link>
  );
}

export function ThoughtNav({ newer, older }: { newer?: ThoughtMeta; older?: ThoughtMeta }) {
  if (!newer && !older) return null;
  return (
    <nav aria-label="More thoughts" className="grid border-t border-line sm:grid-cols-2 sm:gap-10">
      <div>{older && <NavLink thought={older} direction="older" />}</div>
      <div>{newer && <NavLink thought={newer} direction="newer" />}</div>
    </nav>
  );
}
