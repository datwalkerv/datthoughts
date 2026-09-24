import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { readImageSize, resolveLocalAsset, warnOnce } from "./paths";

/**
 * Rewrites relative image/link references in a thought's markdown so they
 * resolve to that thought's folder, and stamps intrinsic image dimensions
 * to prevent layout shift.
 */
export function rehypeLocalAssets({ slug }: { slug: string }) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img" && typeof node.properties.src === "string") {
        const src = node.properties.src;
        const asset = resolveLocalAsset(slug, src);
        if (!asset) {
          if (!/^(?:[a-z]+:|\/\/|\/)/i.test(src)) {
            warnOnce(`${slug}: image "${src}" not found in its folder.`);
          }
          return;
        }
        node.properties.src = asset.url;
        const { width, height } = readImageSize(asset.absolute);
        if (width && height) {
          node.properties.width = width;
          node.properties.height = height;
        }
        if (!node.properties.alt) {
          warnOnce(`${slug}: image "${src}" has no alt text.`);
        }
      }

      if (node.tagName === "a" && typeof node.properties.href === "string") {
        const asset = resolveLocalAsset(slug, node.properties.href);
        if (asset) node.properties.href = asset.url;
      }
    });
  };
}
