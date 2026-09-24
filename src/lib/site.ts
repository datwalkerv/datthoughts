function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "datthoughts",
  title: "datthoughts — a quiet archive of thoughts",
  description:
    "A personal archive of thoughts on life, lessons, experiences, and the small things worth noticing.",
  author: "datthoughts",
  locale: "en_US",
  url: resolveSiteUrl(),
} as const;

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, site.url).toString();
}
