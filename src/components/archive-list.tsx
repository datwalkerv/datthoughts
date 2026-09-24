import Link from "next/link";
import AnimatedContent from "@/components/reactbits/animated-content";
import Spotlight from "@/components/reactbits/spotlight";
import type { ThoughtMeta } from "@/lib/content";
import { formatShortDate, isoDate } from "@/lib/format";

function groupByYear(thoughts: ThoughtMeta[]) {
  const groups = new Map<number, ThoughtMeta[]>();
  for (const thought of thoughts) {
    const year = thought.date.getUTCFullYear();
    groups.set(year, [...(groups.get(year) ?? []), thought]);
  }
  return [...groups.entries()];
}

export function ArchiveItem({ thought }: { thought: ThoughtMeta }) {
  return (
    <Spotlight className="-mx-4 rounded-2xl sm:-mx-5">
    <Link href={`/${thought.slug}`} className="group relative block rounded-2xl px-4 py-6 sm:px-5 sm:py-7">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="text-[1.1875rem] leading-snug font-medium tracking-[-0.02em] text-balance text-ink transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:translate-x-0.5 sm:text-[1.3125rem]">
          {thought.title}
          {thought.draft && <span className="meta ml-3 font-normal">Draft</span>}
        </h3>
        <time dateTime={isoDate(thought.date)} className="meta shrink-0">
          {formatShortDate(thought.date)}
        </time>
      </div>
      {thought.excerpt && (
        <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-relaxed text-pretty text-muted">
          {thought.excerpt}
        </p>
      )}
    </Link>
    </Spotlight>
  );
}

export function ArchiveList({ thoughts }: { thoughts: ThoughtMeta[] }) {
  if (thoughts.length === 0) {
    return <p className="border-t border-line py-16 text-muted">Nothing here yet.</p>;
  }

  return (
    <div>
      {groupByYear(thoughts).map(([year, items]) => (
        <section
          key={year}
          aria-labelledby={`year-${year}`}
          className="grid border-t border-line md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] md:gap-x-10"
        >
          <h2 id={`year-${year}`} className="meta pt-6 sm:pt-7 md:sticky md:top-20 md:self-start md:pt-8">
            {year}
          </h2>
          <ol>
            {items.map((thought, i) => (
              <AnimatedContent key={thought.slug} as="li" distance={8} duration={0.8} delay={Math.min(i, 6) * 0.04}>
                <ArchiveItem thought={thought} />
              </AnimatedContent>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
