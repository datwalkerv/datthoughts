import { ogSize, renderOgImage } from "@/lib/og/render";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "datthoughts — a quiet archive of thoughts";

export default function Image() {
  return renderOgImage({
    title: "A quiet archive of thoughts.",
    subtitle: "On life, lessons, and the small things worth noticing.",
  });
}
