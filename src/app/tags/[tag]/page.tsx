import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveList } from "@/components/archive-list";
import { PageIntro } from "@/components/page-intro";
import { getAllThoughts, getThoughtsByTag, summarizeTags } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return summarizeTags(await getAllThoughts()).map((tag) => ({ tag: tag.slug }));
}

async function findTag(slug: string) {
  return summarizeTags(await getAllThoughts()).find((t) => t.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const tag = await findTag((await params).tag);
  if (!tag) return {};
  return {
    title: tag.name,
    description: `Thoughts tagged “${tag.name}”.`,
    alternates: { canonical: `/tags/${tag.slug}` },
  };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const { tag: slug } = await params;
  const tag = await findTag(slug);
  if (!tag) notFound();
  const thoughts = await getThoughtsByTag(slug);

  return (
    <div className="shell">
      <PageIntro title={tag.name}>
        <p>
          {tag.count} {tag.count === 1 ? "thought" : "thoughts"}
          <span aria-hidden className="mx-2 text-faint">·</span>
          <Link href="/tags" className="transition-colors hover:text-ink">
            All topics
          </Link>
        </p>
      </PageIntro>
      <ArchiveList thoughts={thoughts} />
    </div>
  );
}
