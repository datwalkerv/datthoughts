import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Root as MdastRoot } from "mdast";
import { cache } from "react";
import readingTime from "reading-time";
import {
  firstParagraphText,
  parseMarkdown,
  renderMarkdown,
  takeLeadingTitle,
  truncate,
} from "./markdown";
import {
  CONTENT_DIR,
  assertValidSlug,
  isPublishableFolder,
  readImageSize,
  resolveLocalAsset,
  thoughtDir,
  warnOnce,
} from "./paths";
import { frontmatterSchema, type Thought, type ThoughtMeta } from "./schema";
import { toTags } from "./tags";

const isProduction = process.env.NODE_ENV === "production";
/** Drafts are previewable locally but never ship. */
const includeDrafts = !isProduction;
/** Headings needed before a table of contents earns its space. */
const TOC_MIN_HEADINGS = 3;

interface Parsed {
  meta: ThoughtMeta;
  mdast: MdastRoot;
  tocOverride?: boolean;
}

/** In production, content can't change mid-build, so parse each file once. */
const parsedMemo = new Map<string, Promise<Parsed>>();

/** The markdown file's name inside `content/<slug>/`. */
function findMarkdownFile(slug: string): string | null {
  const candidates = fs
    .readdirSync(thoughtDir(slug))
    .filter((f) => /\.(md|markdown)$/i.test(f))
    .sort();
  if (candidates.length === 0) return null;
  const index = candidates.find((f) => /^index\.(md|markdown)$/i.test(f));
  if (!index && candidates.length > 1) {
    warnOnce(`${slug}: several markdown files and no index.md; using "${candidates[0]}".`,
    );
  }
  return index ?? candidates[0];
}

function humanize(slug: string): string {
  const words = slug.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

async function parseThought(slug: string): Promise<Parsed | null> {
  const filename = findMarkdownFile(slug);
  if (!filename) {
    warnOnce(`${slug}: no markdown file found, skipping.`);
    return null;
  }

  const file = path.join(process.cwd(), "content", slug, filename);
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const result = frontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`[content] Invalid frontmatter in ${path.relative(process.cwd(), file)}:\n${issues}`);
  }
  const fm = result.data;

  const mdast = await parseMarkdown(content);
  const leadingTitle = takeLeadingTitle(mdast);
  const firstParagraph = firstParagraphText(mdast) ?? "";

  let date = fm.date;
  if (!date) {
    date = fs.statSync(file).mtime;
    warnOnce(`${slug}: no "date" in frontmatter; falling back to file mtime.`);
  }

  let cover: ThoughtMeta["cover"];
  if (fm.cover) {
    const asset = resolveLocalAsset(slug, fm.cover);
    if (asset) {
      cover = { src: asset.url, alt: fm.coverAlt ?? "", ...readImageSize(asset.absolute) };
    } else if (/^https?:\/\//.test(fm.cover)) {
      cover = { src: fm.cover, alt: fm.coverAlt ?? "" };
    } else {
      warnOnce(`${slug}: cover "${fm.cover}" not found.`);
    }
  }

  const stats = readingTime(content);
  const excerpt = truncate(firstParagraph);

  return {
    mdast,
    tocOverride: fm.toc,
    meta: {
      slug,
      title: fm.title ?? leadingTitle ?? humanize(slug),
      date,
      updated: fm.updated,
      hasDescription: Boolean(fm.description),
      description: fm.description ?? truncate(firstParagraph, 160),
      excerpt: fm.description ?? excerpt,
      tags: toTags(fm.tags),
      cover,
      draft: fm.draft ?? false,
      readingMinutes: Math.max(1, Math.round(stats.minutes)),
      words: stats.words,
    },
  };
}

function loadParsed(slug: string): Promise<Parsed | null> {
  if (!isProduction) return parseThought(slug);
  let pending = parsedMemo.get(slug);
  if (!pending) {
    pending = parseThought(slug) as Promise<Parsed>;
    parsedMemo.set(slug, pending);
  }
  return pending;
}

function listSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isPublishableFolder(entry.name))
    .map((entry) => {
      assertValidSlug(entry.name);
      return entry.name;
    });
}

/** All published thoughts, newest first. */
export const getAllThoughts = cache(async (): Promise<ThoughtMeta[]> => {
  const parsed = await Promise.all(listSlugs().map(loadParsed));
  return parsed
    .filter((p): p is Parsed => p !== null)
    .map((p) => p.meta)
    .filter((meta) => includeDrafts || !meta.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title));
});

export const getThought = cache(async (slug: string): Promise<Thought | null> => {
  const meta = (await getAllThoughts()).find((t) => t.slug === slug);
  if (!meta) return null;

  const parsed = await loadParsed(slug);
  if (!parsed) return null;

  const { tree, headings } = await renderMarkdown(parsed.mdast, slug);
  return {
    ...meta,
    tree,
    headings,
    showToc: parsed.tocOverride ?? headings.length >= TOC_MIN_HEADINGS,
  };
});

/** `newer` and `older` relative to the given thought in the archive. */
export async function getAdjacentThoughts(slug: string) {
  const thoughts = await getAllThoughts();
  const index = thoughts.findIndex((t) => t.slug === slug);
  return {
    newer: index > 0 ? thoughts[index - 1] : undefined,
    older: index >= 0 && index < thoughts.length - 1 ? thoughts[index + 1] : undefined,
  };
}

export async function getThoughtsByTag(tagSlug: string): Promise<ThoughtMeta[]> {
  const thoughts = await getAllThoughts();
  return thoughts.filter((t) => t.tags.some((tag) => tag.slug === tagSlug));
}
