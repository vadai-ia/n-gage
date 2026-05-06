"use client";

/**
 * HowItWorks — Variant-aware.
 * Cada variante tiene 3 pasos con copy/iconos propios, manteniendo la misma estructura visual.
 */

import { motion } from "framer-motion";
import { QrCode, Camera, Heart, Users, Briefcase, MessageCircle, MapPin, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { useVariant } from "./VariantProvider";

const ICONS = { QrCode, Camera, Heart, Users, Briefcase, MessageCircle, MapPin, Sparkles };

const COPY = {
  general: {
    eyebrow: "Cómo funciona",
    title: "Tan simple que parece",
    titleEm: "magia",
    sub: "En menos de 60 segundos, cualquier invitado está adentro y conectando.",
    pull: "Lo que pase después,",
    pullEm: "ya es entre ustedes.",
    steps: [
      { n: "01", icon: "QrCode" as const, title: "Escanea", body: "Apunta tu cámara al código. Sin descargas, sin apps. Tu pase entra solo." },
      { n: "02", icon: "Camera" as const, title: "Tu selfie del momento", body: "Así te reconocen los demás. Sin filtros, sin galería — solo tú, en tu mejor noche." },
      { n: "03", icon: "Heart" as const, title: "Recorre y elige", body: "Descubre quién anda por aquí. Da like, super like, o pasa. Si es mutuo, te avisamos al instante." },
    ],
  },
  weddings: {
    eyebrow: "Cómo funciona en tu boda",
    title: "Sus mundos",
    titleEm: "se conocen",
    sub: "Tus invitados llegan con QR personalizado y descubren a quién más vino, sin tener que preguntar.",
    pull: "Cuando todos se conocen,",
    pullEm: "la boda no termina nunca.",
    steps: [
      { n: "01", icon: "QrCode" as const, title: "QR en cada invitación", body: "Mandas las invitaciones con un QR único. Tus invitados entran días antes — desde el save the date." },
      { n: "02", icon: "Users" as const, title: "Conocen a la familia", body: "Sus padres ven quién es quién. Tus amigos descubren a los del otro lado. Las mesas dejan de ser un misterio." },
      { n: "03", icon: "Heart" as const, title: "La noche se desbloquea", body: "Brindis personalizados, fotos compartidas, conexiones que no hubieran pasado si tuvieran que romper el hielo solos." },
    ],
  },
  events: {
    eyebrow: "Cómo funciona en tu evento",
    title: "Networking que",
    titleEm: "sí pasa",
    sub: "Acreditación, agenda y conexiones en una sola plataforma. Tus asistentes salen con relaciones, no con tarjetas.",
    pull: "Lo que se conecta, se queda.",
    pullEm: "Lo que se queda, vuelve.",
    steps: [
      { n: "01", icon: "QrCode" as const, title: "Acreditación instantánea", body: "QR en email + en la entrada. Sin filas, sin badges. Datos del asistente listos en su perfil profesional." },
      { n: "02", icon: "Briefcase" as const, title: "Match por intereses", body: "Cada asistente declara qué busca: socios, talento, inversión, clientes. El sistema sugiere a quién hay que conocer." },
      { n: "03", icon: "MessageCircle" as const, title: "Sigue el contacto", body: "Después del evento, los matches conservan acceso. Las relaciones reales sobreviven al cierre del recinto." },
    ],
  },
} as const;

export function HowItWorks() {
  const { variant } = useVariant();
  const copy = COPY[variant];

  // Color stops por step según variante
  const stepColors = {
    general: ["#FF2D78", "#7B2FBE", "#1A6EFF"],
    weddings: ["#D4A574", "#C9A87C", "#B5895C"],
    events: ["#1A6EFF", "#3A85FF", "#0046CC"],
  }[variant];

  return (
    <section
      id="como-funciona"
      data-screen-label={`02 Cómo funciona · ${variant}`}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <p className="eyebrow-v mb-5">{copy.eyebrow}</p>
          <h2
            className="font-display font-bold leading-tight mb-5"
            style={{
              fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)",
              color: "var(--v-fg)",
              fontWeight: variant === "weddings" ? 500 : 700,
              letterSpacing: variant === "weddings" ? "-0.02em" : "-0.03em",
            }}
          >
            {copy.title}{" "}
            <span className="gradient-text-v" style={{ fontStyle: "italic" }}>
              {copy.titleEm}
            </span>
            .
          </h2>
          <p
            className="text-base lg:text-lg"
            style={{ color: "var(--v-fg-2)", textAlign: "center" }}
          >
            {copy.sub}
          </p>
        </Reveal>

        {/* Línea conectora desktop */}
        <div className="relative">
          <div
            aria-hidden
            className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${stepColors[0]} 20%, ${stepColors[1]} 50%, ${stepColors[2]} 80%, transparent)`,
            }}
          />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 relative">
            {copy.steps.map((step, i) => {
              const Icon = ICONS[step.icon];
              const color = stepColors[i];
              return (
                <Reveal key={step.n} delay={i * 0.15}>
                  <div className="text-center group">
                    <div className="relative inline-block mb-6">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -3 }}
                        transition={{ duration: 0.3 }}
                        className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center relative z-10"
                        style={{
                          background: `linear-gradient(135deg, ${color}25, ${color}05)`,
                          border: `1px solid ${color}40`,
                          boxShadow: `0 0 40px ${color}30`,
                        }}
                      >
                        <Icon size={36} style={{ color }} strokeWidth={1.5} />
                      </motion.div>
                      <span
                        className="absolute -top-2 -right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs"
                        style={{
                          background: "var(--v-bg)",
                          border: `1px solid ${color}60`,
                          color,
                        }}
                      >
                        {step.n}
                      </span>
                    </div>
                    <h3
                      className="font-display font-bold text-2xl mb-3"
                      style={{
                        color: "var(--v-fg)",
                        fontWeight: variant === "weddings" ? 500 : 700,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm lg:text-base leading-relaxed max-w-sm mx-auto"
                      style={{ color: "var(--v-fg-2)" }}
                    >
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.3} className="text-center mt-14">
          <p
            className="font-display italic text-lg lg:text-xl"
            style={{ color: "var(--v-fg)" }}
          >
            {copy.pull}{" "}
            <span className="gradient-text-v font-bold">{copy.pullEm}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
