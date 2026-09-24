"use client";

/**
 * BlurText — adapted from React Bits (https://reactbits.dev/text-animations/blur-text).
 * Changes: flows inline (so it can sit inside a heading next to other text),
 * adds `startDelay` for chaining, exposes the full text to assistive tech, and
 * resolves instantly under `prefers-reduced-motion` (same tree, so hydration
 * stays consistent).
 */
import { motion, useReducedMotion, type Easing, type Transition } from "motion/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

type Snapshot = Record<string, string | number>;

interface BlurTextProps {
  text: string;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
  /** Stagger between segments, in ms. */
  delay?: number;
  /** Wait before the first segment, in ms. */
  startDelay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Snapshot;
  animationTo?: Snapshot[];
  easing?: Easing | Easing[];
  stepDuration?: number;
  onAnimationComplete?: () => void;
}

function buildKeyframes(from: Snapshot, steps: Snapshot[]) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const frames: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    frames[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return frames;
}

export default function BlurText({
  text,
  as: Tag = "span",
  className = "",
  delay = 200,
  startDelay = 0,
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  stepDuration = 0.35,
  onAnimationComplete,
}: BlurTextProps) {
  const reduceMotion = useReducedMotion();
  const segments = animateBy === "words" ? text.split(" ") : Array.from(text);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const from = useMemo<Snapshot>(
    () => animationFrom ?? { filter: "blur(10px)", opacity: 0, y: direction === "top" ? -50 : 50 },
    [animationFrom, direction],
  );
  const to = useMemo<Snapshot[]>(
    () =>
      animationTo ?? [
        { filter: "blur(5px)", opacity: 0.5, y: direction === "top" ? 5 : -5 },
        { filter: "blur(0px)", opacity: 1, y: 0 },
      ],
    [animationTo, direction],
  );
  const keyframes = useMemo(() => buildKeyframes(from, to), [from, to]);

  const stepCount = to.length + 1;
  const times = Array.from({ length: stepCount }, (_, i) => i / (stepCount - 1));

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {segments.map((segment, index) => {
        const transition: Transition = reduceMotion
          ? { duration: 0 }
          : {
              duration: stepDuration * (stepCount - 1),
              times,
              delay: (startDelay + index * delay) / 1000,
              ease: easing,
            };
        return (
          <Fragment key={index}>
            <motion.span
              aria-hidden
              initial={from}
              animate={reduceMotion ? to[to.length - 1] : inView ? keyframes : from}
              transition={transition}
              onAnimationComplete={index === segments.length - 1 ? onAnimationComplete : undefined}
              style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
            >
              {segment === " " ? " " : segment}
            </motion.span>
            {animateBy === "words" && index < segments.length - 1 && " "}
          </Fragment>
        );
      })}
    </Tag>
  );
}
