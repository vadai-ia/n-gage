"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { formatNumber } from "@/lib/recap/format";

type Props = { value: number; suffix?: string; durationMs?: number };

export default function CountUp({ value, suffix = "", durationMs = 1200 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView || reduceMotion) { setShown(value); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, durationMs, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums" aria-label={`${formatNumber(value)}${suffix}`}>
      {formatNumber(shown)}{suffix}
    </span>
  );
}
