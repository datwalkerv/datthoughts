import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const fontFile = (file: string) =>
  fs.readFile(path.join(process.cwd(), "node_modules/@fontsource/geist-sans/files", file));

async function loadFonts() {
  const [regular, semibold] = await Promise.all([
    fontFile("geist-sans-latin-400-normal.woff"),
    fontFile("geist-sans-latin-600-normal.woff"),
  ]);
  return [
    { name: "Geist", data: regular, style: "normal" as const, weight: 400 as const },
    { name: "Geist", data: semibold, style: "normal" as const, weight: 600 as const },
  ];
}

interface OgCardProps {
  title: string;
  /** Muted line under the title. */
  subtitle?: string;
  /** Local image as a data URI, shown as a quiet panel on the right. */
  image?: string;
}

export async function renderOgImage({ title, subtitle, image }: OgCardProps) {
  const titleSize = title.length > 60 ? 60 : title.length > 30 ? 72 : 84;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0b0c", color: "#ededed", fontFamily: "Geist" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>datthoughts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: titleSize, fontWeight: 600, lineHeight: 1.08, letterSpacing: -titleSize * 0.04 }}>
              {title}
            </div>
            {subtitle && <div style={{ display: "flex", fontSize: 26, color: "#9a9a9e" }}>{subtitle}</div>}
          </div>
        </div>
        {image && (
          <div style={{ display: "flex", padding: "40px 40px 40px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain img. */}
            <img src={image} alt="" width={360} height={550} style={{ width: 360, height: 550, objectFit: "cover", borderRadius: 16 }} />
          </div>
        )}
      </div>
    ),
    { ...ogSize, fonts: await loadFonts() },
  );
}
