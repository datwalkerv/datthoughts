import type { Element, Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";
import { toString as hastToString } from "hast-util-to-string";
import { toString as mdastToString } from "mdast-util-to-string";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Heading } from "./schema";
import { rehypeLocalAssets } from "./rehype-local-assets";

const remarkProcessor = unified().use(remarkParse).use(remarkGfm).use(remarkSmartypants);

/** Parse markdown into a typographically cleaned-up mdast. */
export async function parseMarkdown(markdown: string): Promise<MdastRoot> {
  return (await remarkProcessor.run(remarkProcessor.parse(markdown))) as MdastRoot;
}

/**
 * A leading `# Title` doubles as the title fallback. It is removed from the
 * body either way so it never renders twice beneath the page header.
 */
export function takeLeadingTitle(tree: MdastRoot): string | undefined {
  const first = tree.children[0];
  if (first?.type === "heading" && first.depth === 1) {
    tree.children.shift();
    return mdastToString(first).trim() || undefined;
  }
  return undefined;
}

export function firstParagraphText(tree: MdastRoot): string | undefined {
  const paragraph = tree.children.find(
    (node) => node.type === "paragraph" && mdastToString(node).trim().length > 0,
  );
  return paragraph ? mdastToString(paragraph).replace(/\s+/g, " ").trim() : undefined;
}

export function truncate(text: string, max = 180): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.—–-]+$/, "")}…`;
}

export async function renderMarkdown(
  tree: MdastRoot,
  slug: string,
): Promise<{ tree: HastRoot; headings: Heading[] }> {
  const processor = unified()
    .use(remarkRehype, { footnoteLabel: "Notes", footnoteBackLabel: "Back to reference" })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["heading-anchor"] },
      test: ["h2", "h3", "h4"],
    })
    .use(rehypePrettyCode, {
      theme: "min-dark",
      keepBackground: false,
      defaultLang: { block: "plaintext" },
    })
    .use(rehypeLocalAssets, { slug });

  const hast = (await processor.run(structuredClone(tree))) as HastRoot;

  const headings: Heading[] = [];
  visit(hast, "element", (node: Element) => {
    if ((node.tagName === "h2" || node.tagName === "h3") && typeof node.properties.id === "string") {
      headings.push({
        id: node.properties.id,
        text: hastToString(node).trim(),
        depth: node.tagName === "h2" ? 2 : 3,
      });
    }
  });

  return { tree: hast, headings };
}
