import type { Tag, ThoughtMeta } from "./schema";

export function tagSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toTags(names: string[] = []): Tag[] {
  const seen = new Map<string, Tag>();
  for (const name of names) {
    const slug = tagSlug(name);
    if (slug && !seen.has(slug)) seen.set(slug, { name, slug });
  }
  return [...seen.values()];
}

export interface TagSummary extends Tag {
  count: number;
}

export function summarizeTags(thoughts: ThoughtMeta[]): TagSummary[] {
  const counts = new Map<string, TagSummary>();
  for (const thought of thoughts) {
    for (const tag of thought.tags) {
      const entry = counts.get(tag.slug) ?? { ...tag, count: 0 };
      entry.count += 1;
      counts.set(tag.slug, entry);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
