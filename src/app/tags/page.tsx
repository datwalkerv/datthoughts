import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import Spotlight from "@/components/reactbits/spotlight";
import { getAllThoughts, summarizeTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Topics",
  description: "The threads that run through the archive.",
  alternates: { canonical: "/tags" },
};

export default async function TagsPage() {
  const tags = summarizeTags(await getAllThoughts());

  return (
    <div className="shell">
      <PageIntro title="Topics">
        <p>The threads that keep showing up.</p>
      </PageIntro>
      {tags.length === 0 ? (
        <p className="border-t border-line py-16 text-muted">No topics yet.</p>
      ) : (
        <ul className="border-t border-line">
          {tags.map((tag) => (
            <li key={tag.slug} className="border-b border-line py-1">
              <Spotlight className="-mx-4 rounded-2xl sm:-mx-5">
              <Link href={`/tags/${tag.slug}`} className="group relative flex items-baseline justify-between gap-6 rounded-2xl px-4 py-5 sm:px-5">
                <span className="text-[1.3125rem] font-medium tracking-[-0.02em] text-ink transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-0.5">
                  {tag.name}
                </span>
                <span className="meta">
                  {tag.count} {tag.count === 1 ? "thought" : "thoughts"}
                </span>
              </Link>
              </Spotlight>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
