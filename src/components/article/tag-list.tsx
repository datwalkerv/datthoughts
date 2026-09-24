import Link from "next/link";
import { Fragment } from "react";
import type { Tag } from "@/lib/content";

/** Inline, comma-separated topic links. */
export function TagList({ tags }: { tags: Tag[] }) {
  return (
    <>
      {tags.map((tag, i) => (
        <Fragment key={tag.slug}>
          {i > 0 && ", "}
          <Link
            href={`/tags/${tag.slug}`}
            className="text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            {tag.name}
          </Link>
        </Fragment>
      ))}
    </>
  );
}
