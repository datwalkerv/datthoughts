"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandMenu, type SearchItem } from "@/components/command-menu";
import ShinyText from "@/components/reactbits/shiny-text";

const nav = [
  { href: "/", label: "Archive", match: (p: string) => p === "/" },
  { href: "/tags", label: "Topics", match: (p: string) => p.startsWith("/tags") },
];

export function SiteHeader({ searchItems }: { searchItems: SearchItem[] }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="shell flex h-14 items-center justify-between gap-6">
        <Link
          href="/"
          className="-ml-1 flex min-h-11 items-center px-1 text-[0.9375rem] font-medium tracking-[-0.02em]"
        >
          <ShinyText text="datthoughts" color="#ededed" shineColor="#7c7c82" speed={2.4} delay={6} spread={110} />
        </Link>
        <div className="flex items-center gap-2 sm:gap-5">
          <nav aria-label="Primary">
            <ul className="flex items-center text-[0.8125rem] text-muted">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={item.match(pathname) ? "page" : undefined}
                    className="flex min-h-11 items-center px-3 transition-colors duration-200 hover:text-ink aria-[current=page]:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="-mr-3 sm:mr-0">
            <CommandMenu items={searchItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
