import fs from "node:fs/promises";
import path from "node:path";
import { getAllThoughts, resolveLocalAsset } from "@/lib/content";
import { formatDate, readingLabel } from "@/lib/format";
import { ogSize, renderOgImage } from "@/lib/og/render";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "datthoughts";

export async function generateStaticParams() {
  const thoughts = await getAllThoughts();
  return thoughts.map((t) => ({ slug: t.slug }));
}

async function coverDataUri(slug: string, src?: string) {
  if (!src) return undefined;
  const asset = resolveLocalAsset(slug, decodeURIComponent(src.replace(`/${slug}/`, "")));
  if (!asset || !/\.(png|jpe?g)$/i.test(asset.absolute)) return undefined;
  const mime = path.extname(asset.absolute).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${(await fs.readFile(asset.absolute)).toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const thought = (await getAllThoughts()).find((t) => t.slug === slug);
  if (!thought) return renderOgImage({ title: "Not found" });

  return renderOgImage({
    title: thought.title,
    subtitle: `${formatDate(thought.date)} · ${readingLabel(thought.readingMinutes)}`,
    image: await coverDataUri(slug, thought.cover?.src),
  });
}
