import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

export const CONTENT_DIR = path.join(process.cwd(), "content");

/** Slugs that would collide with real routes. */
const RESERVED_SLUGS = new Set([
  "tags",
  "feed.xml",
  "rss",
  "sitemap.xml",
  "robots.txt",
  "opengraph-image",
  "api",
  "_next",
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertValidSlug(slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `[content] "${slug}" is not a valid folder name. Use lowercase kebab-case, e.g. "why-i-stopped-chasing".`,
    );
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`[content] "${slug}" is reserved by a site route. Rename the folder.`);
  }
}

/** Folders prefixed with `_` or `.` are private (templates, scratch). */
export function isPublishableFolder(name: string): boolean {
  return !name.startsWith("_") && !name.startsWith(".");
}

export function thoughtDir(slug: string): string {
  return path.join(CONTENT_DIR, slug);
}

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i;

export interface ResolvedAsset {
  /** Path relative to the thought folder, always posix. */
  relative: string;
  absolute: string;
  /** Public URL the asset route serves it from. */
  url: string;
}

/**
 * Resolve a reference written in markdown (`./walk.jpg`, `images/a.png`)
 * against its thought folder. Returns null for URLs, absolute paths, and
 * anchors, which are left untouched.
 */
export function resolveLocalAsset(slug: string, ref: string): ResolvedAsset | null {
  if (!ref || EXTERNAL.test(ref)) return null;
  const [clean] = ref.split(/[?#]/);
  let decoded: string;
  try {
    decoded = decodeURI(clean);
  } catch {
    decoded = clean;
  }
  const relative = path.posix.normalize(decoded.replace(/^\.\//, ""));
  if (relative.startsWith("..") || path.posix.isAbsolute(relative)) {
    throw new Error(`[content] ${slug}: "${ref}" points outside its folder.`);
  }
  const absolute = path.join(thoughtDir(slug), relative);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return null;
  const url = `/${slug}/${relative.split("/").map(encodeURIComponent).join("/")}`;
  return { relative, absolute, url };
}

export function readImageSize(absolute: string): { width?: number; height?: number } {
  try {
    const { width, height } = imageSize(fs.readFileSync(absolute));
    return { width, height };
  } catch {
    return {};
  }
}

/** Every non-markdown file inside a thought folder, recursively. */
export function listAssetFiles(slug: string): string[] {
  const root = thoughtDir(slug);
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (!/\.(md|markdown)$/i.test(entry.name)) {
        out.push(path.relative(root, abs).split(path.sep).join("/"));
      }
    }
  };
  walk(root);
  return out;
}

const MIME: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".csv": "text/csv; charset=utf-8",
};

export function mimeType(file: string): string {
  return MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

const warned = new Set<string>();

/** Content warnings surface once per process, not once per rendered page. */
export function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[content] ${message}`);
}
