"use client";

/**
 * BrandingShowcase — Variant-aware.
 *
 * Por variante mostramos solo los temas relevantes y customizamos el copy del
 * header. La grid de features de personalización es la misma en todas (es la
 * promesa central del producto).
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { useVariant } from "./VariantProvider";

type Theme = {
  id: string;
  label: string;
  variants: Array<"general" | "weddings" | "events">;
  palette: string[];
  bg: string;
  title: string;
  sub: string;
  badge: string;
};

const THEMES: Theme[] = [
  {
    id: "wedding",
    label: "Boda elegante",
    variants: ["general", "weddings"],
    palette: ["#D4AF37", "#F5E6C8", "#1A1A2E"],
    bg: "linear-gradient(135deg, #D4AF37 0%, #F5E6C8 50%, #8B7355 100%)",
    title: "Sofía & Mateo",
    sub: "12 de octubre · Hacienda San Marcos",
    badge: "RSVP confirmado",
  },
  {
    id: "wedding-modern",
    label: "Boda moderna",
    variants: ["weddings"],
    palette: ["#E8D5B8", "#9C7B5C", "#1A1A2E"],
    bg: "linear-gradient(135deg, #E8D5B8 0%, #C9A87C 50%, #6B5238 100%)",
    title: "Camila & Diego",
    sub: "Marzo 2026 · Querétaro",
    badge: "Save the date",
  },
  {
    id: "festival",
    label: "Festival neón",
    variants: ["general", "events"],
    palette: ["#00FF88", "#7B2FBE", "#0F0F1A"],
    bg: "linear-gradient(135deg, #00FF88 0%, #7B2FBE 50%, #1A6EFF 100%)",
    title: "VOLT 2026",
    sub: "3 días · 4 escenarios · 47K personas",
    badge: "Día 2 · 22:30",
  },
  {
    id: "corporate",
    label: "Tech corporativo",
    variants: ["general", "events"],
    palette: ["#1A6EFF", "#0066CC", "#0A0A1F"],
    bg: "linear-gradient(135deg, #1A6EFF 0%, #0066CC 50%, #001F3F 100%)",
    title: "Kickoff Q1",
    sub: "Annual offsite · 320 colaboradores",
    badge: "Day 2 · Networking",
  },
  {
    id: "cruise",
    label: "Crucero turquesa",
    variants: ["general", "events"],
    palette: ["#00C9C9", "#006B9F", "#FFFFFF"],
    bg: "linear-gradient(135deg, #00C9C9 0%, #006B9F 50%, #003B5C 100%)",
    title: "Caribe 7 noches",
    sub: "Cabina 8412 · Cubierta 8",
    badge: "Noche 4 · Lounge Sunset",
  },
  {
    id: "sports",
    label: "Reto deportivo",
    variants: ["general", "events"],
    palette: ["#FF3B3B", "#FFB800", "#0A0A0A"],
    bg: "linear-gradient(135deg, #FF3B3B 0%, #FF6B00 50%, #0A0A0A 100%)",
    title: "RUN/X Edición 7",
    sub: "Categoría Élite · BIB 0247",
    badge: "Post-meta · Carpa B",
  },
  {
    id: "xv",
    label: "XV años",
    variants: ["general", "weddings"],
    palette: ["#FF2D78", "#FFB800", "#1A1A2E"],
    bg: "linear-gradient(135deg, #FF2D78 0%, #FFB800 70%, #1A1A2E 100%)",
    title: "Fernanda · 15 años",
    sub: "Salón Imperial · Sábado",
    badge: "Brindis a las 23h",
  },
];

const FEATURES = {
  general: [
    "Logo, paleta y tipografías",
    "Splash screen y loading",
    "Texto del onboarding",
    "Notificaciones in-app",
    "Email transaccional",
    "QR personalizado (con logo embebido)",
    "Dominio propio (tu-evento.com)",
    "Idioma del evento",
  ],
  weddings: [
    "Iniciales y monograma de la pareja",
    "Paleta de la boda y tipografía propia",
    "Save the date + RSVP integrado",
    "Mensajes de los novios al match",
    "Álbum colectivo del día",
    "QR en invitación física y digital",
    "URL personalizada (sofia-y-mateo.com)",
    "Idioma + textos editados por ustedes",
  ],
  events: [
    "Logo, paleta y tipografía corporativa",
    "Track / agenda del evento",
    "Onboarding por rol (asistente, speaker, sponsor)",
    "Notificaciones por sesión y zona",
    "Email transaccional con tu dominio",
    "QR con logo embebido (acreditación)",
    "Subdominio o dominio dedicado",
    "Reportes con identidad de tu marca",
  ],
} as const;

const HEADER = {
  general: {
    eyebrow: "Branding y personalización",
    title: "Tu marca. Tu evento.",
    titleEm: "Tu universo visual",
    sub: "N'GAGE no es una app que se mete en tu evento. Es tu evento, ahora también en pantalla.",
    listTitle: "Personalizable de pies a cabeza:",
    setup:
      "Setup en menos de 24 horas. Tú compartes tu identidad visual, nosotros la convertimos en una app lista para tu evento.",
  },
  weddings: {
    eyebrow: "Su universo, en cada pantalla",
    title: "El detalle del invitación,",
    titleEm: "ahora vive también ahí",
    sub: "Tipografía, paleta, monograma, hasta el tono con el que les hablan a sus invitados. Todo respira como respira su boda.",
    listTitle: "Personalizable de pies a cabeza:",
    setup:
      "Setup en menos de 72 horas. Nos cuentan cómo es su boda, nosotros la convertimos en una experiencia digital con la misma alma.",
  },
  events: {
    eyebrow: "Tu marca corporativa, sin compromisos",
    title: "Tu evento.",
    titleEm: "Tu marca. Tus datos",
    sub: "White-label real: subdominio dedicado, métricas con tu identidad, integración con tu CRM. Tu equipo de marketing va a estar feliz.",
    listTitle: "White-label total:",
    setup:
      "Setup en 5-7 días para eventos enterprise. Implementación con tu equipo de TI/Marketing y handoff completo de la plataforma con tu marca.",
  },
} as const;

export function BrandingShowcase() {
  const { variant } = useVariant();
  const head = HEADER[variant];
  const features = FEATURES[variant];
  const themes = THEMES.filter((t) => t.variants.includes(variant));

  const [active, setActive] = useState(0);
  const theme = themes[Math.min(active, themes.length - 1)];

  return (
    <section
      id="para-tu-evento"
      data-screen-label={`04 Branding · ${variant}`}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      {/* Background animado */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30 blur-3xl"
        animate={{ background: theme.bg }}
        transition={{ duration: 0.8 }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-14">
          <p className="eyebrow-v mb-5">{head.eyebrow}</p>
          <h2
            className="font-display font-bold leading-tight mb-5"
            style={{
              fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)",
              color: "var(--v-fg)",
              fontWeight: variant === "weddings" ? 500 : 700,
              letterSpacing: variant === "weddings" ? "-0.02em" : "-0.03em",
            }}
          >
            {head.title}{" "}
            <span className="gradient-text-v" style={{ fontStyle: "italic" }}>
              {head.titleEm}
            </span>
            .
          </h2>
          <p
            className="text-base lg:text-lg"
            style={{ color: "var(--v-fg-2)", textAlign: "center" }}
          >
            {head.sub}
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
                  <div
                    className="relative w-full h-full rounded-[32px] overflow-hidden"
                    style={{ background: theme.bg }}
                  >
                    <div
                      className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full z-20"
                      style={{ background: "#000" }}
                    />
                    <div className="absolute top-9 left-0 right-0 px-5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/90">
                        {theme.badge}
                      </span>
                      <div className="flex gap-1">
                        {theme.palette.map((c) => (
                          <span
                            key={c}
                            className="w-2 h-2 rounded-full"
                            style={{ background: c, boxShadow: `0 0 6px ${c}` }}
                          />
                        ))}
                      </div>
                    </div>
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
                    <div className="absolute bottom-8 left-5 right-5">
                      <div
                        className="rounded-full py-3 text-center text-xs font-bold"
                        style={{
                          background: "rgba(255,255,255,0.18)",
                          color: "#fff",
                          backdropFilter: "blur(20px)",
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}
                      >
                        Empieza a conectar
                      </div>
                    </div>
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/3"
                      style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
                      }}
                    />
                  </div>
                </motion.div>
              </Reveal>

              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {themes.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(i)}
                    className="px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all"
                    style={{
                      background:
                        active === i ? "var(--v-gradient)" : "var(--v-bg-2)",
                      color: active === i ? "#fff" : "var(--v-fg-2)",
                      border:
                        active === i
                          ? "1px solid rgba(255,255,255,0.2)"
                          : "1px solid var(--v-line)",
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
            <h3
              className="font-display font-bold text-2xl mb-6"
              style={{ color: "var(--v-fg)" }}
            >
              {head.listTitle}
            </h3>
            <ul className="space-y-3">
              {features.map((f, i) => (
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
                    style={{ background: "var(--v-gradient)" }}
                  >
                    <Check size={13} className="text-white" strokeWidth={3} />
                  </span>
                  <span className="text-base" style={{ color: "var(--v-fg)" }}>
                    {f}
                  </span>
                </motion.li>
              ))}
            </ul>

            <div
              className="mt-8 p-5 rounded-2xl"
              style={{
                background: "var(--v-card)",
                border: "1px solid var(--v-line)",
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--v-fg-2)" }}
              >
                <span
                  className="font-display font-semibold"
                  style={{ color: "var(--v-fg)" }}
                >
                  {head.setup.split(".")[0]}.
                </span>{" "}
                {head.setup.split(".").slice(1).join(".").trim()}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
