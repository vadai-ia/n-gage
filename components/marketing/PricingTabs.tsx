"use client";

/**
 * PricingTabs — Página de pricing completa con tabs por variante.
 *
 * - General: 3 tiers (Spark $1,899 / Vibe $3,299 / Luxe $4,899)
 * - Weddings: 4 tiers (Spark $2,499 / Vibe $3,499 / Luxe $4,499 / Royal $5,000)
 * - Events: cotización a la medida (sin precios públicos)
 *
 * El tab cambia el tema visual de la página completa (data-variant).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, Mail, MessageCircle } from "lucide-react";
import { Reveal } from "./Reveal";
import { PRICING, type Variant } from "@/lib/landing/variant";

type TabId = Variant;

const TABS: { id: TabId; label: string; sub: string }[] = [
  { id: "general",  label: "N'GAGE",      sub: "Cualquier evento" },
  { id: "weddings", label: "/ WEDDINGS",  sub: "Bodas y XV años" },
  { id: "events",   label: "/ EVENTS",    sub: "Corporativos · masivos" },
];

const HEADERS: Record<TabId, { eyebrow: string; title: string; titleEm: string; sub: string }> = {
  general: {
    eyebrow: "Planes & inversión",
    title: "Un plan para cada",
    titleEm: "tamaño de evento",
    sub: "Bodas, festivales, conciertos, cruceros, deportivos, corporativos chicos. Eventos de hasta 800 invitados.",
  },
  weddings: {
    eyebrow: "Inversión nupcial",
    title: "Su día,",
    titleEm: "con todo el detalle",
    sub: "Cuatro experiencias diseñadas para bodas y celebraciones íntimas. Hasta 250+ invitados con servicio premium.",
  },
  events: {
    eyebrow: "Eventos enterprise",
    title: "Cotización",
    titleEm: "a la medida",
    sub: "Festivales, conferencias, kickoffs, eventos masivos. White-label, integraciones, SLA enterprise.",
  },
};

export function PricingTabs() {
  const [active, setActive] = useState<TabId>("general");

  // Aplica data-variant al body cuando cambia el tab
  useEffect(() => {
    document.body.setAttribute("data-variant", active);
    return () => {
      document.body.setAttribute("data-variant", "general");
    };
  }, [active]);

  const head = HEADERS[active];
  const tiers = active === "events" ? null : PRICING[active];

  return (
    <main className="relative pt-32 lg:pt-40 pb-24 overflow-hidden">
      <div className="aurora-v" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono mb-8"
          style={{ color: "var(--v-fg-3)" }}
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <Reveal>
          <p className="eyebrow-v mb-5">{head.eyebrow}</p>
          <h1
            className="font-display font-bold leading-[1.05] mb-6"
            style={{
              fontSize: "clamp(2.25rem, 6vw, 4.75rem)",
              color: "var(--v-fg)",
              fontWeight: active === "weddings" ? 500 : 700,
              letterSpacing: active === "weddings" ? "-0.025em" : "-0.035em",
            }}
          >
            {head.title}{" "}
            <span className="gradient-text-v" style={{ fontStyle: "italic" }}>
              {head.titleEm}
            </span>
            .
          </h1>
          <p className="text-base lg:text-xl mb-10 max-w-2xl" style={{ color: "var(--v-fg-2)" }}>
            {head.sub}
          </p>
        </Reveal>

        {/* Tabs */}
        <div
          className="inline-flex flex-wrap gap-1 p-1.5 rounded-full mb-10"
          style={{
            background: "var(--v-bg-2)",
            border: "1px solid var(--v-line-2)",
            backdropFilter: "blur(20px)",
          }}
          role="tablist"
        >
          {TABS.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(t.id)}
                className="relative px-4 sm:px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest transition-colors"
                style={{
                  background: isActive ? "var(--v-gradient)" : "transparent",
                  color: isActive ? "#fff" : "var(--v-fg-3)",
                  boxShadow: isActive ? "0 0 24px rgba(var(--v-accent-rgb), 0.35)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {tiers ? (
              <div className={`grid sm:grid-cols-2 ${tiers.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 lg:gap-5`}>
                {tiers.map((tier) => (
                  <article
                    key={tier.name}
                    className="relative p-6 lg:p-7 rounded-3xl flex flex-col h-full transition-all"
                    style={{
                      background: tier.featured ? "var(--v-card-strong)" : "var(--v-card)",
                      border: tier.featured
                        ? "1.5px solid rgba(var(--v-accent-rgb), 0.5)"
                        : "1px solid var(--v-line)",
                      backdropFilter: "blur(20px)",
                      boxShadow: tier.featured ? "var(--v-glow)" : "none",
                    }}
                  >
                    {tier.featured && tier.badge && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap"
                        style={{ background: "var(--v-gradient)", color: "#fff" }}
                      >
                        <Sparkles size={9} /> {tier.badge}
                      </span>
                    )}
                    <h3
                      className="font-display font-bold text-2xl mb-1"
                      style={{ color: "var(--v-fg)", fontWeight: active === "weddings" ? 500 : 700 }}
                    >
                      {tier.name}
                    </h3>
                    <p className="text-xs mb-5" style={{ color: "var(--v-fg-3)" }}>
                      {tier.cap}
                    </p>
                    <div className="mb-5">
                      <span
                        className="font-display font-bold gradient-text-v"
                        style={{ fontSize: 38, lineHeight: 1, letterSpacing: "-0.02em" }}
                      >
                        ${tier.price.toLocaleString("es-MX")}
                      </span>
                      <span className="text-xs ml-1.5" style={{ color: "var(--v-fg-3)" }}>
                        MXN · evento
                      </span>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--v-fg-2)" }}>
                          <span
                            className="w-4 h-4 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--v-gradient)" }}
                          >
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/#contacto"
                      className="flex items-center justify-center gap-1.5 w-full py-3 rounded-full text-sm font-bold transition-all"
                      style={
                        tier.featured
                          ? { background: "var(--v-gradient)", color: "#fff", boxShadow: "0 0 24px rgba(var(--v-accent-rgb), 0.35)" }
                          : { background: "transparent", color: "var(--v-fg)", border: "1px solid var(--v-line-2)" }
                      }
                    >
                      Empezar <ArrowRight size={14} />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              // Events: cotización a la medida
              <div
                className="rounded-3xl p-8 lg:p-12 text-center"
                style={{
                  background: "var(--v-card-strong)",
                  border: "1px solid var(--v-line-2)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "var(--v-glow)",
                }}
              >
                <p className="eyebrow-v justify-center mb-4" style={{ display: "inline-flex" }}>
                  Cotización · Enterprise
                </p>
                <h3
                  className="font-display font-bold mb-4"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "var(--v-fg)" }}
                >
                  Cada evento es <span className="gradient-text-v" style={{ fontStyle: "italic" }}>único</span>.
                </h3>
                <p className="max-w-2xl mx-auto mb-8 text-base lg:text-lg" style={{ color: "var(--v-fg-2)" }}>
                  Festivales, conferencias, kickoffs, eventos masivos. Cotizamos según volumen,
                  white-label, integraciones (CRM, SSO, ticketing), SLA, multi-zona y compliance.
                  Te respondemos en menos de 24h con propuesta económica + deck técnico.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 mb-10 max-w-3xl mx-auto">
                  {[
                    { k: "Asistentes", v: "1K - 50K+" },
                    { k: "Setup", v: "5-14 días" },
                    { k: "SLA", v: "99.9%" },
                  ].map((s) => (
                    <div
                      key={s.k}
                      className="p-5 rounded-2xl"
                      style={{ background: "var(--v-bg-2)", border: "1px solid var(--v-line)" }}
                    >
                      <div
                        className="font-display font-bold gradient-text-v"
                        style={{ fontSize: 28, lineHeight: 1 }}
                      >
                        {s.v}
                      </div>
                      <div
                        className="font-mono uppercase mt-2"
                        style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--v-fg-3)" }}
                      >
                        {s.k}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/eventos#contacto"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-base"
                    style={{ background: "var(--v-gradient)", color: "#fff", boxShadow: "var(--v-glow)" }}
                  >
                    Solicitar cotización <ArrowRight size={18} />
                  </Link>
                  <a
                    href="mailto:hola@ngage.com.mx"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base"
                    style={{ color: "var(--v-fg)", border: "1px solid var(--v-line-2)" }}
                  >
                    <Mail size={16} /> hola@ngage.com.mx
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Aviso */}
        <div
          className="mt-14 p-6 rounded-3xl flex items-start gap-4"
          style={{
            background: "var(--v-card)",
            border: "1px solid var(--v-line)",
            backdropFilter: "blur(20px)",
          }}
        >
          <span
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--v-bg-2)",
              border: "1px solid rgba(var(--v-accent-rgb), 0.3)",
            }}
          >
            <MessageCircle size={18} style={{ color: "var(--v-accent)" }} />
          </span>
          <div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--v-fg-2)" }}>
              <span style={{ color: "var(--v-fg)", fontWeight: 600 }}>
                Cada propuesta incluye:
              </span>{" "}
              configuración del evento, branding personalizado, soporte el día,
              álbum colectivo y reportes post-evento. Algunos planes suman: integraciones con CRM,
              multi-zona, activaciones de patrocinador, dominio propio y SLA enterprise.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
