import type { ReactNode } from "react";

export function PageIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="pt-24 pb-20 sm:pt-36 sm:pb-28">
      <h1 className="text-[length:var(--text-intro)] leading-[1.15] font-semibold tracking-[-0.035em] text-ink">
        {title}
      </h1>
      {children && <div className="mt-4 text-[1.0625rem] text-muted">{children}</div>}
    </section>
  );
}
