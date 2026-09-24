import type { Element, Root } from "hast";
import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";
import type { ComponentProps } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { CodeBlock } from "./code-block";
import { MarkdownImage, MarkdownParagraph } from "./figure";

type WithNode<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T> & { node?: Element };

function MarkdownLink({ href = "", node: _node, ...props }: WithNode<"a">) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...props}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    />
  );
}

function MarkdownTable({ node: _node, ...props }: WithNode<"table">) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Table">
      <table {...props} />
    </div>
  );
}

const components = {
  a: MarkdownLink,
  img: ({ node: _node, ...props }: WithNode<"img">) => <MarkdownImage {...props} />,
  p: MarkdownParagraph,
  pre: ({ node: _node, ...props }: WithNode<"pre">) => <CodeBlock {...props} />,
  table: MarkdownTable,
} as Partial<Components>;

export function MarkdownBody({ tree }: { tree: Root }) {
  return (
    <div className="prose-thought">
      {toJsxRuntime(tree, { Fragment, jsx, jsxs, components, passNode: true })}
    </div>
  );
}
