"use client";

import { useRef, type ReactNode } from "react";

export function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="magnetic"
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r || !ref.current) return;
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </div>
  );
}
