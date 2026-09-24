import fs from "node:fs/promises";
import { getAllThoughts, listAssetFiles, mimeType, resolveLocalAsset } from "@/lib/content";

/**
 * Serves files that live next to a thought's markdown, e.g.
 * content/why-i-stopped-chasing/walk.jpg → /why-i-stopped-chasing/walk.jpg.
 * Everything is enumerated at build time, so this is fully static.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const thoughts = await getAllThoughts();
  return thoughts.flatMap((t) =>
    listAssetFiles(t.slug).map((file) => ({ slug: t.slug, asset: file.split("/") })),
  );
}

export async function GET(_request: Request, ctx: RouteContext<"/[slug]/[...asset]">) {
  const { slug, asset } = await ctx.params;
  const thoughts = await getAllThoughts();
  if (!thoughts.some((t) => t.slug === slug)) return new Response("Not found", { status: 404 });

  const ref = asset.map(decodeURIComponent).join("/");
  if (/\.(md|markdown)$/i.test(ref)) return new Response("Not found", { status: 404 });

  let resolved;
  try {
    resolved = resolveLocalAsset(slug, ref);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!resolved) return new Response("Not found", { status: 404 });

  const file = await fs.readFile(resolved.absolute);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": mimeType(resolved.absolute),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
