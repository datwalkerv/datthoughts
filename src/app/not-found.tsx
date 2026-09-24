import Link from "next/link";
import ShinyText from "@/components/reactbits/shiny-text";

export default function NotFound() {
  return (
    <div className="shell pt-24 sm:pt-36">
      <p className="meta mb-5">404</p>
      <h1 className="max-w-[20ch] text-[length:var(--text-intro)] leading-[1.15] font-semibold tracking-[-0.035em] text-balance text-ink">
        This thought was never written down.{" "}
        <ShinyText
          text="Or maybe it was, and then quietly let go."
          className="inline!"
          color="#9a9a9e"
          shineColor="#f5f5f5"
          speed={3.2}
          delay={2.5}
          spread={100}
        />
      </h1>
      <Link href="/" className="meta mt-10 inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-ink">
        <span aria-hidden>←</span> Back to the archive
      </Link>
    </div>
  );
}
