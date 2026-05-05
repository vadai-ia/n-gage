"use client";

import { motion } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";
import { Reveal } from "./Reveal";

type Status = "yes" | "no" | "partial";

const FEATURES: { label: string; ngage: Status; dating: Status; eventNet: Status }[] = [
  { label: "Match contextual al evento",                 ngage: "yes", dating: "no", eventNet: "partial" },
  { label: "Identidad efímera (sin perfil permanente)",  ngage: "yes", dating: "no", eventNet: "no" },
  { label: "Selfie del momento (foto-accountability)",   ngage: "yes", dating: "no", eventNet: "no" },
  { label: "Álbum colectivo del evento",                 ngage: "yes", dating: "no", eventNet: "no" },
  { label: "Brandeable 100% por evento",                 ngage: "yes", dating: "no", eventNet: "partial" },
  { label: "Sin descarga (web/PWA)",                     ngage: "yes", dating: "no", eventNet: "no" },
  { label: "Filtro inteligente de orientación",          ngage: "yes", dating: "no", eventNet: "no" },
  { label: "Webhooks + API para CRM",                    ngage: "yes", dating: "no", eventNet: "partial" },
  { label: "Métricas del evento en tiempo real",         ngage: "yes", dating: "no", eventNet: "partial" },
  { label: "Multi-evento / multi-organizador",           ngage: "yes", dating: "no", eventNet: "partial" },
];

function Cell({ status, brand }: { status: Status; brand?: boolean }) {
  if (status === "yes") {
    return brand ? (
      <span className="inline-flex w-7 h-7 rounded-full items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FF2D78, #1A6EFF)" }}>
        <Check size={15} className="text-white" strokeWidth={3} />
      </span>
    ) : (
      <Check size={18} style={{ color: "#10B981" }} strokeWidth={2.5} />
    );
  }
  if (status === "partial") return <AlertTriangle size={16} style={{ color: "#FFB800" }} />;
  return <X size={16} style={{ color: "#44445A" }} />;
}

export function ComparisonTable() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FF2D78" }}>
            Por qué N&apos;GAGE
          </p>
          <h2 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Lo que <span className="gradient-text italic">ninguna otra</span> plataforma hace.
          </h2>
        </Reveal>

        <Reveal>
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: "rgba(15,15,26,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Header */}
            <div
              className="grid items-center px-4 lg:px-6 py-5 text-[10px] lg:text-xs font-mono font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns: "1fr 90px 90px 90px", background: "rgba(7,7,15,0.5)", color: "#8585A8" }}
            >
              <span>Característica</span>
              <span className="text-center">
                <span className="gradient-text font-display font-black text-sm not-italic">N&apos;GAGE</span>
              </span>
              <span className="text-center">Apps de citas</span>
              <span className="text-center">Apps de evento</span>
            </div>

            {/* Filas */}
            {FEATURES.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="grid items-center px-4 lg:px-6 py-4 border-t"
                style={{ gridTemplateColumns: "1fr 90px 90px 90px", borderColor: "rgba(255,255,255,0.04)" }}
              >
                <span className="text-sm lg:text-base font-medium pr-3" style={{ color: "#F0F0FF" }}>
                  {row.label}
                </span>
                <span className="text-center"><Cell status={row.ngage} brand /></span>
                <span className="text-center"><Cell status={row.dating} /></span>
                <span className="text-center"><Cell status={row.eventNet} /></span>
              </motion.div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs" style={{ color: "#8585A8" }}>
            <span className="flex items-center gap-2">
              <span className="inline-flex w-5 h-5 rounded-full items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FF2D78, #1A6EFF)" }}>
                <Check size={11} className="text-white" strokeWidth={3} />
              </span>
              Incluido
            </span>
            <span className="flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: "#FFB800" }} /> Parcial / depende
            </span>
            <span className="flex items-center gap-2">
              <X size={14} style={{ color: "#44445A" }} /> No disponible
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
