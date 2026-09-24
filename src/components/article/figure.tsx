/* eslint-disable @next/next/no-img-element -- markdown images are served from the content folder with known dimensions. */
import type { Element, ElementContent } from "hast";
import type { ComponentProps } from "react";

export function MarkdownImage({ alt = "", ...props }: ComponentProps<"img">) {
  return (
    <img
      {...props}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="block h-auto w-full rounded-lg bg-surface"
    />
  );
}

function isImageOnly(node?: Element): boolean {
  if (!node) return false;
  const meaningful = node.children.filter(
    (child: ElementContent) => !(child.type === "text" && child.value.trim() === ""),
  );
  return (
    meaningful.length === 1 &&
    meaningful[0].type === "element" &&
    meaningful[0].tagName === "img"
  );
}

/**
 * A paragraph that holds nothing but an image becomes a figure. The image's
 * markdown title (`![alt](./a.jpg "Caption")`) becomes its caption.
 */
export function MarkdownParagraph({
  node,
  children,
  ...props
}: ComponentProps<"p"> & { node?: Element }) {
  if (node && isImageOnly(node)) {
    const img = node.children.find(
      (c): c is Element => c.type === "element" && c.tagName === "img",
    );
    const caption = typeof img?.properties.title === "string" ? img.properties.title : undefined;
    return (
      <figure className="figure-breakout">
        {children}
        {caption && (
          <figcaption className="meta mt-4 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }
  return <p {...props}>{children}</p>;
}
