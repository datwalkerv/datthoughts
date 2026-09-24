import type { Root } from "hast";
import { z } from "zod";

/** Every field is optional: a bare markdown file is a valid thought. */
export const frontmatterSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    date: z.coerce.date({ error: "must be a date like 2026-09-20" }).optional(),
    updated: z.coerce.date({ error: "must be a date like 2026-09-20" }).optional(),
    description: z.string().trim().min(1).optional(),
    tags: z
      .union([z.array(z.string().trim().min(1)), z.string().trim().min(1)])
      .transform((v) => (Array.isArray(v) ? v : v.split(",").map((t) => t.trim())))
      .optional(),
    cover: z.string().trim().min(1).optional(),
    coverAlt: z.string().trim().optional(),
    draft: z.boolean().optional(),
    toc: z.boolean().optional(),
  })
  .strict();

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface Tag {
  name: string;
  slug: string;
}

export interface LocalImage {
  src: string;
  width?: number;
  height?: number;
  alt: string;
}

export interface ThoughtMeta {
  slug: string;
  title: string;
  date: Date;
  updated?: Date;
  /** True when `description` was written by hand rather than derived. */
  hasDescription: boolean;
  description: string;
  excerpt: string;
  tags: Tag[];
  cover?: LocalImage;
  draft: boolean;
  readingMinutes: number;
  words: number;
}

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface Thought extends ThoughtMeta {
  /** Processed HTML AST; render with <MarkdownBody />. */
  tree: Root;
  headings: Heading[];
  showToc: boolean;
}
