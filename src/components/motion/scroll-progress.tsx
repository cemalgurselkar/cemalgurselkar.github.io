"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

// Rationale: A hairline progress cue helps long editorial pages feel navigable without adding a second navigation control.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 32,
    restDelta: 0.001,
    stiffness: 140,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="scroll-progress"
      style={{ scaleX: reduceMotion ? scrollYProgress : smoothProgress }}
    />
  );
}
