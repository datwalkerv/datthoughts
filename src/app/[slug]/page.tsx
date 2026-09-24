/* eslint-disable @next/next/no-img-element -- cover images are served from the content folder with known dimensions. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLink } from "@/components/article/copy-link";
import { MarkdownBody } from "@/components/article/markdown-body";
import { ReadingEdge } from "@/components/article/reading-edge";
import { TagList } from "@/components/article/tag-list";
import { ThoughtNav } from "@/components/article/thought-nav";
import { InlineTableOfContents, TableOfContents } from "@/components/article/toc";
import { getAdjacentThoughts, getAllThoughts, getThought } from "@/lib/content";
import { formatDate, isoDate, readingLabel } from "@/lib/format";
import { absoluteUrl, site } from "@/lib/site";

export const dynamicParams = false;

export async function generateStaticParams() {
  const thoughts = await getAllThoughts();
  return thoughts.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const thought = await getThought(slug);
  if (!thought) return {};

  return {
    title: thought.title,
    description: thought.description,
    keywords: thought.tags.map((t) => t.name),
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "article",
      url: `/${slug}`,
      title: thought.title,
      description: thought.description,
      publishedTime: thought.date.toISOString(),
      modifiedTime: (thought.updated ?? thought.date).toISOString(),
      authors: [site.author],
      tags: thought.tags.map((t) => t.name),
    },
    twitter: { card: "summary_large_image", title: thought.title, description: thought.description },
    robots: thought.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function ThoughtPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const thought = await getThought(slug);
  if (!thought) notFound();
  const { newer, older } = await getAdjacentThoughts(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: thought.title,
    description: thought.description,
    datePublished: thought.date.toISOString(),
    dateModified: (thought.updated ?? thought.date).toISOString(),
    wordCount: thought.words,
    keywords: thought.tags.map((t) => t.name).join(", "),
    url: absoluteUrl(`/${slug}`),
    mainEntityOfPage: absoluteUrl(`/${slug}`),
    image: absoluteUrl(`/${slug}/opengraph-image`),
    author: { "@type": "Person", name: site.author },
    publisher: { "@type": "Person", name: site.author },
  };

  return (
    <>
      <div aria-hidden className="reading-progress" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article className="shell pt-8 sm:pt-12">
        <div className="mx-auto max-w-[var(--measure)]">
          <Link
            href="/"
            className="group meta -ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 transition-colors hover:text-ink"
          >
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-0.5">
              ←
            </span>
            Archive
          </Link>

          <header className="pt-16 sm:pt-24">
            <h1 className="text-[length:var(--text-title)] leading-[1.06] font-semibold tracking-[-0.04em] text-balance text-ink">
              {thought.title}
            </h1>
            {thought.hasDescription && (
              <p className="mt-5 text-[1.1875rem] leading-relaxed text-pretty text-muted sm:text-[1.3125rem]">
                {thought.description}
              </p>
            )}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
            <p className="meta">
              <time dateTime={isoDate(thought.date)}>{formatDate(thought.date)}</time>
              <span aria-hidden className="mx-2 text-faint">·</span>
              {readingLabel(thought.readingMinutes)}
              {thought.draft && (
                <>
                  <span aria-hidden className="mx-2 text-faint">·</span>Draft
                </>
              )}
            </p>
            <CopyLink />
            </div>
          </header>
        </div>

        {thought.cover && (
          <figure className="mx-auto mt-14 max-w-[60rem] sm:mt-20">
            <img
                src={thought.cover.src}
                alt={thought.cover.alt}
                width={thought.cover.width}
                height={thought.cover.height}
                className="block aspect-[16/9] h-auto w-full rounded-xl bg-surface object-cover"
            />
          </figure>
        )}

        <div className="relative mx-auto mt-14 max-w-[var(--measure)] sm:mt-20">
          {thought.showToc && (
            <div className="xl:hidden">
              <InlineTableOfContents headings={thought.headings} />
            </div>
          )}
          <MarkdownBody tree={thought.tree} />
          {thought.showToc && (
            <aside className="absolute top-0 left-full hidden h-full w-56 pl-16 xl:block">
              <TableOfContents headings={thought.headings} />
            </aside>
          )}
        </div>

        <footer className="mx-auto mt-24 max-w-[var(--measure)]">
          {thought.tags.length > 0 && (
            <p className="meta mb-16">
              Filed under <TagList tags={thought.tags} />
            </p>
          )}
          <ThoughtNav newer={newer} older={older} />
        </footer>
      </article>
      <ReadingEdge />
    </>
  );
}
