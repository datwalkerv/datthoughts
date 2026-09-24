import { ArchiveList } from "@/components/archive-list";
import BlurText from "@/components/reactbits/blur-text";
import ShinyText from "@/components/reactbits/shiny-text";
import { getAllThoughts } from "@/lib/content";

export default async function HomePage() {
  const thoughts = await getAllThoughts();

  return (
    <div className="shell">
      <section className="pt-28 pb-24 sm:pt-44 sm:pb-36">
        <h1 className="max-w-[24ch] text-[length:var(--text-intro)] leading-[1.15] font-semibold tracking-[-0.035em] text-balance text-ink">
          <BlurText
            text="A quiet archive of thoughts."
            delay={70}
            direction="bottom"
            stepDuration={0.32}
            animationFrom={{ filter: "blur(8px)", opacity: 0, y: 10 }}
            animationTo={[
              { filter: "blur(3px)", opacity: 0.6, y: -1 },
              { filter: "blur(0px)", opacity: 1, y: 0 },
            ]}
          />{" "}
          <span className="intro-fade">
            <ShinyText
              text="Written slowly, kept honestly, shared quietly."
              color="#8e8e93"
              shineColor="#f5f5f5"
              speed={3.6}
              delay={3}
              spread={100}
            />
          </span>
        </h1>
      </section>
      <ArchiveList thoughts={thoughts} />
    </div>
  );
}
