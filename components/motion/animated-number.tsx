"use client";

/**
 * Counts up to a number when it scrolls into view. Modelled on Motion Primitives'
 * AnimatedNumber. Server-rendered with the final value, so it is never wrong or empty.
 */
import { useInView, useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  format = (v) => Math.round(v).toLocaleString("en-US"),
  className,
}: {
  value: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const [shown, setShown] = useState<string | null>(null);

  useMotionValueEvent(spring, "change", (v) => setShown(format(v)));

  useEffect(() => {
    if (inView && !reduce) {
      spring.jump(value * 0.6);
      spring.set(value);
    }
  }, [inView, reduce, spring, value]);

  return (
    <span ref={ref} className={className}>
      {shown ?? format(value)}
    </span>
  );
}
