"use client";

/**
 * Manifesto — Sección editorial variant-aware.
 * Cada variante trae su propio texto poético + stat strip.
 */

import { Reveal } from "./Reveal";
import { useVariant } from "./VariantProvider";

export function Manifesto() {
  const { variant, content } = useVariant();

  return (
    <section
      data-screen-label={`Manifesto · ${variant}`}
      className="relative py-20 lg:py-32 overflow-hidden"
    >
      {/* Glow ambient para acompañar el texto */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, rgba(var(--v-accent-rgb), 0.45), transparent 60%)" }}
      />

      <div className="relative max-w-4xl mx-auto px-5 lg:px-8 text-center">
        <Reveal>
          <p className="eyebrow-v mb-6 justify-center" style={{ display: "inline-flex" }}>
            Manifesto
          </p>
          <div className="space-y-5 lg:space-y-7">
            {content.manifestoHtml.map((line, i) => (
              <p
                key={i}
                className="font-display leading-tight tracking-tight"
                style={{
                  color: "var(--v-fg)",
                  fontSize:
                    i === 0
                      ? "clamp(1.6rem, 3.6vw, 2.6rem)"
                      : "clamp(1.05rem, 1.8vw, 1.3rem)",
                  fontWeight: i === 0 ? (variant === "weddings" ? 500 : 700) : 400,
                  fontStyle: i === 0 ? "normal" : "normal",
                  letterSpacing: i === 0 ? "-0.025em" : "-0.005em",
                  lineHeight: i === 0 ? 1.1 : 1.55,
                }}
                dangerouslySetInnerHTML={{ __html: line }}
              />
            ))}
          </div>
          <p
            className="mt-10 font-mono text-[11px] tracking-[0.18em] uppercase"
            style={{ color: "var(--v-fg-3)" }}
          >
            {content.manifestoSig}
          </p>
        </Reveal>

        {/* Stat strip */}
        <Reveal delay={0.2} className="mt-16 lg:mt-20">
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 py-8 px-4 sm:px-8 rounded-3xl"
            style={{
              background: "var(--v-card)",
              border: "1px solid var(--v-line)",
              backdropFilter: "blur(20px)",
            }}
          >
            {content.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="font-display font-bold tracking-tight gradient-text-v"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)", lineHeight: 1 }}
                >
                  {s.num}
                </div>
                <div
                  className="font-mono uppercase mt-2"
                  style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--v-fg-3)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
