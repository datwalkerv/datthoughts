"use client";

/**
 * AnimatedContent — adapted from React Bits (https://reactbits.dev/animations/animated-content).
 * Ported from GSAP/ScrollTrigger to `motion` (already used by BlurText) to
 * keep the bundle small. Same props for the parts we use; under
 * `prefers-reduced-motion` content appears instantly (same tree, so
 * hydration stays consistent).
 */
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface AnimatedContentProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  initialOpacity?: number;
  scale?: number;
  threshold?: number;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}

export default function AnimatedContent({
  children,
  className,
  distance = 24,
  direction = "vertical",
  reverse = false,
  duration = 0.8,
  initialOpacity = 0,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  as = "div",
}: AnimatedContentProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];
  const axis = direction === "horizontal" ? "x" : "y";
  const offset = reverse ? -distance : distance;
  const shown = { [axis]: 0, scale: 1, opacity: 1 };

  return (
    <Component
      className={className}
      initial={{ [axis]: offset, scale, opacity: initialOpacity }}
      animate={reduceMotion ? shown : undefined}
      whileInView={reduceMotion ? undefined : shown}
      viewport={{ once: true, amount: threshold }}
      transition={reduceMotion ? { duration: 0 } : { duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
