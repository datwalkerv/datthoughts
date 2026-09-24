import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer data-site-footer className="mt-40 border-t border-line/70">
      <div className="shell meta flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="text-ink-soft">datthoughts</span>
          <span className="mx-2 text-faint">·</span>© {new Date().getFullYear()} {site.author}
        </p>
        <ul className="-mx-2 flex">
          <li>
            <Link href="/" className="px-2 py-2 transition-colors hover:text-ink">
              Archive
            </Link>
          </li>
          <li>
            <Link href="/tags" className="px-2 py-2 transition-colors hover:text-ink">
              Topics
            </Link>
          </li>
          <li>
            <a href="/feed.xml" className="px-2 py-2 transition-colors hover:text-ink">
              RSS
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
