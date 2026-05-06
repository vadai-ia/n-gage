"use client";

/**
 * Hero — Variant-aware.
 *
 * Lee copy/CTAs/meta de useVariant() y aplica tokens v-* via CSS vars.
 * Mantiene Tailwind + Framer Motion del stack del repo.
 */

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ParticleField } from "./ParticleField";
import { PhoneMockup } from "./PhoneMockup";
import { useVariant } from "./VariantProvider";

export function Hero() {
  const { variant, content } = useVariant();
  const reduce = useReducedMotion();

  return (
    <section
      data-screen-label={`01 Hero · ${variant}`}
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12 lg:pb-16"
    >
      {/* Aurora variant blobs */}
      <div className="aurora-v -z-10" aria-hidden />

      {/* Particle field — pinta accent del variante actual */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <ParticleField density={45} />
      </div>

      {/* Grid noise sutil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full px-5 lg:px-8 grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
        {/* Copy */}
        <div className="lg:col-span-7 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow-v mb-6"
          >
            {content.eyebrow}
          </motion.p>

          <h1
            className="font-display font-bold leading-[0.96] tracking-tight mb-6"
            style={{
              fontSize: variant === "weddings"
                ? "clamp(2.4rem, 5.6vw, 5rem)"
                : "clamp(2.75rem, 7vw, 6rem)",
              color: "var(--v-fg)",
              fontWeight: variant === "weddings" ? 500 : 700,
              letterSpacing: variant === "weddings" ? "-0.025em" : "-0.035em",
              lineHeight: variant === "weddings" ? 1.04 : 0.96,
            }}
          >
            <motion.span
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-[0.25em]"
            >
              {content.h1Pre}
            </motion.span>{" "}
            <motion.em
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.27, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-[0.25em] not-italic"
              style={{ fontStyle: "italic", fontWeight: variant === "weddings" ? 400 : 500 }}
            >
              {content.h1Em}
            </motion.em>{" "}
            <motion.span
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.39, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block gradient-text-v"
            >
              {content.h1Post}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-base lg:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            style={{ color: "var(--v-fg-2)" }}
            // ledeHtml es contenido nuestro literal (no input usuario), seguro de inyectar.
            dangerouslySetInnerHTML={{ __html: content.ledeHtml }}
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-10"
          >
            <Link
              href="#contacto"
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-base transition-all"
              style={{
                background: "var(--v-gradient)",
                color: "#fff",
                boxShadow: "var(--v-glow)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              {content.cta1}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base transition-all"
              style={{
                color: "var(--v-fg)",
                border: "1px solid var(--v-line-2)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--v-bg-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {content.cta2} →
            </Link>
          </motion.div>

          {/* Hero meta stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap gap-6 lg:gap-8 pt-6 border-t justify-center lg:justify-start"
            style={{ borderColor: "var(--v-line)" }}
          >
            {content.heroMeta.map((m) => (
              <div key={m.label} className="flex flex-col gap-1">
                <span
                  className="font-display font-bold tracking-tight"
                  style={{ fontSize: 26, color: "var(--v-fg)" }}
                >
                  {m.num}
                </span>
                <span
                  className="font-mono uppercase"
                  style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--v-fg-3)" }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center"
        >
          <PhoneMockup />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:block"
        style={{ color: "var(--v-fg-3)" }}
        aria-hidden
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
