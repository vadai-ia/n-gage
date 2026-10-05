"use client";

import type { LucideIcon } from "lucide-react";

type Props = {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function RecapCard({ title, subtitle, icon: Icon, accent = "#FF2D78", action, className = "", children }: Props) {
  return (
    <section
      className={`rounded-3xl p-5 backdrop-blur-xl ${className}`}
      style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}1F`, color: accent }}>
                <Icon size={18} aria-hidden />
              </span>
            )}
            <div>
              {title && <h2 className="font-display text-base font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm" style={{ color: "var(--fg-3)" }}>{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
