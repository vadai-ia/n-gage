"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  as?: "div" | "section" | "li" | "article";
};

export function Reveal({ children, delay = 0, y = 32, className, once = true, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: once });
  const Tag = motion[as];

  return (
    <Tag
      ref={ref}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
