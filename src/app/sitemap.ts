import type { MetadataRoute } from "next";
import { getAllThoughts, summarizeTags } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const thoughts = (await getAllThoughts()).filter((t) => !t.draft);
  const latest = thoughts[0]?.date;

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tags"), lastModified: latest, priority: 0.4 },
    ...thoughts.map((t) => ({
      url: absoluteUrl(`/${t.slug}`),
      lastModified: t.updated ?? t.date,
      priority: 0.8,
    })),
    ...summarizeTags(thoughts).map((tag) => ({
      url: absoluteUrl(`/tags/${tag.slug}`),
      priority: 0.3,
    })),
  ];
}
