"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";

const THEMES = [
  {
    id: "wedding",
    label: "Boda elegante",
    palette: ["#D4AF37", "#F5E6C8", "#1A1A2E"],
    bg: "linear-gradient(135deg, #D4AF37 0%, #F5E6C8 50%, #8B7355 100%)",
    title: "Sofía & Mateo",
    sub: "12 de octubre · Hacienda San Marcos",
    badge: "RSVP confirmado",
  },
  {
    id: "festival",
    label: "Festival neón",
    palette: ["#00FF88", "#7B2FBE", "#0F0F1A"],
    bg: "linear-gradient(135deg, #00FF88 0%, #7B2FBE 50%, #1A6EFF 100%)",
    title: "VOLT 2026",
    sub: "3 días · 4 escenarios · 47K personas",
    badge: "Día 2 · 22:30",
  },
  {
    id: "corporate",
    label: "Tech corporativo",
    palette: ["#1A6EFF", "#0066CC", "#0A0A1F"],
    bg: "linear-gradient(135deg, #1A6EFF 0%, #0066CC 50%, #001F3F 100%)",
    title: "Kickoff Q1",
    sub: "Annual offsite · 320 colaboradores",
    badge: "Day 2 · Networking",
  },
  {
    id: "cruise",
    label: "Crucero turquesa",
    palette: ["#00C9C9", "#006B9F", "#FFFFFF"],
    bg: "linear-gradient(135deg, #00C9C9 0%, #006B9F 50%, #003B5C 100%)",
    title: "Caribe 7 noches",
    sub: "Cabina 8412 · Cubierta 8",
    badge: "Noche 4 · Lounge Sunset",
  },
  {
    id: "sports",
    label: "Reto deportivo",
    palette: ["#FF3B3B", "#FFB800", "#0A0A0A"],
    bg: "linear-gradient(135deg, #FF3B3B 0%, #FF6B00 50%, #0A0A0A 100%)",
    title: "RUN/X Edición 7",
    sub: "Categoría Élite · BIB 0247",
    badge: "Post-meta · Carpa B",
  },
];

const FEATURES = [
  "Logo, paleta y tipografías",
  "Splash screen y loading",
  "Texto del onboarding",
  "Notificaciones in-app",
  "Email transaccional",
  "QR personalizado (con logo embebido)",
  "Dominio propio (tu-evento.com)",
  "Idioma del evento",
];

export function BrandingShowcase() {
  const [active, setActive] = useState(0);
  const theme = THEMES[active];

  return (
    <section id="para-tu-evento" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background animado */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30 blur-3xl"
        animate={{ background: theme.bg }}
        transition={{ duration: 0.8 }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FFB800" }}>
            Branding y personalización
          </p>
          <h2 className="font-display font-bold leading-tight mb-5" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Tu marca. Tu evento.{" "}
            <span className="gradient-text italic">Tu universo visual</span>.
          </h2>
          <p className="text-base lg:text-lg" style={{ color: "#8585A8" }}>
            N&apos;GAGE no es una app que se mete en tu evento. Es tu evento, ahora también en pantalla.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Phone preview cambiante */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative mx-auto" style={{ maxWidth: 480 }}>
              <Reveal>
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, scale: 0.96, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative rounded-[40px] overflow-hidden p-2"
                  style={{
                    background: "linear-gradient(160deg, #2A2A40, #0F0F1A)",
                    boxShadow: `0 50px 100px rgba(0,0,0,0.7), 0 0 80px ${theme.palette[0]}30`,
                    aspectRatio: "9 / 19",
                  }}
                >
                  <div className="relative w-full h-full rounded-[32px] overflow-hidden" style={{ background: theme.bg }}>
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full z-20" style={{ background: "#000" }} />

                    {/* Header */}
                    <div className="absolute top-9 left-0 right-0 px-5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/90">{theme.badge}</span>
                      <div className="flex gap-1">
                        {theme.palette.map((c) => (
                          <span key={c} className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                        ))}
                      </div>
                    </div>

                    {/* Centro: nombre del evento */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                      <motion.h4
                        key={theme.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display font-bold text-3xl text-white drop-shadow-lg leading-tight mb-2"
                      >
                        {theme.title}
                      </motion.h4>
                      <motion.p
                        key={theme.sub}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-white/85 font-medium"
                      >
                        {theme.sub}
                      </motion.p>
                    </div>

                    {/* CTA simulado */}
                    <div className="absolute bottom-8 left-5 right-5">
                      <div
                        className="rounded-full py-3 text-center text-xs font-bold"
                        style={{ background: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)" }}
                      >
                        Empieza a conectar
                      </div>
                    </div>

                    {/* Overlay de marca abajo */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/3"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}
                    />
                  </div>
                </motion.div>
              </Reveal>

              {/* Selector de tema */}
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {THEMES.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(i)}
                    className="px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all"
                    style={{
                      background: active === i ? "linear-gradient(135deg, #FF2D78, #7B2FBE)" : "rgba(255,255,255,0.04)",
                      color: active === i ? "#fff" : "#8585A8",
                      border: active === i ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de features */}
          <Reveal delay={0.15} className="lg:col-span-5 order-1 lg:order-2">
            <h3 className="font-display font-bold text-2xl mb-6" style={{ color: "#F0F0FF" }}>
              Personalizable de pies a cabeza:
            </h3>
            <ul className="space-y-3">
              {FEATURES.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="w-6 h-6 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #1A6EFF)" }}
                  >
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </span>
                  <span className="text-base" style={{ color: "#F0F0FF" }}>{f}</span>
                </motion.li>
              ))}
            </ul>

            <div
              className="mt-8 p-5 rounded-2xl"
              style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "#8585A8" }}>
                <span className="font-display font-semibold" style={{ color: "#F0F0FF" }}>
                  Setup en menos de 24 horas.
                </span>{" "}
                Tú nos compartes tu identidad visual, nosotros la convertimos en una app lista para tu evento. Sin código, sin diseñadores, sin esperas.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
