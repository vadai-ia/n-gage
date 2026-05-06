"use client";

/**
 * PhoneMockup — Variant-aware iPhone mockup.
 *
 * Cada variante tiene 8 fotos Unsplash distintas que ciclan cada 2.4s con
 * fade+zoom suave. La card muestra nombre + microcopy contextual.
 *
 * Las imágenes se precargan en mount para evitar flash en cambios.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useVariant } from "./VariantProvider";

type CardData = {
  src: string;
  name: string;
  meta: string;
  badge: string;
};

const CARDS: Record<"general" | "weddings" | "events", CardData[]> = {
  general: [
    { src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80&auto=format&fit=crop", name: "Camila, 26", meta: "Mesa 12 · Aquí esta noche", badge: "Super like recibido" },
    { src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80&auto=format&fit=crop", name: "Andrés, 29", meta: "Bar principal · 2 amigos en común", badge: "Match nuevo" },
    { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80&auto=format&fit=crop", name: "Sofía, 24", meta: "Pista · Llegó hace 12min", badge: "Cerca de ti" },
    { src: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&q=80&auto=format&fit=crop", name: "Daniel, 31", meta: "Lounge · Aquí esta noche", badge: "Nuevo en el evento" },
    { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80&auto=format&fit=crop", name: "Valeria, 27", meta: "Mesa 8 · 3 intereses en común", badge: "Match nuevo" },
    { src: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80&auto=format&fit=crop", name: "Javier, 28", meta: "Terraza · Hace 5 min", badge: "Te miró" },
    { src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80&auto=format&fit=crop", name: "Lucía, 25", meta: "Bar 2 · Recién llegada", badge: "Super like recibido" },
    { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&auto=format&fit=crop", name: "Mateo, 30", meta: "Mesa 5 · Conoce a Ana", badge: "Match nuevo" },
  ],
  weddings: [
    { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop", name: "Mariana", meta: "Familia de la novia", badge: "Te recomendó" },
    { src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80&auto=format&fit=crop", name: "Tomás", meta: "Amigo del novio · Mesa 3", badge: "Conoce a Sofía" },
    { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80&auto=format&fit=crop", name: "Camila & Diego", meta: "Padrinos · Mesa de honor", badge: "Recién casados" },
    { src: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=600&q=80&auto=format&fit=crop", name: "Lucía", meta: "Prima de la novia · Mesa 7", badge: "Quiere conocerte" },
    { src: "https://images.unsplash.com/photo-1521543387324-67c2bf45fc1a?w=600&q=80&auto=format&fit=crop", name: "Andrés", meta: "Hermano del novio", badge: "Habla en el brindis" },
    { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80&auto=format&fit=crop", name: "Isabella", meta: "Dama de honor · Mesa 1", badge: "Match nuevo" },
    { src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80&auto=format&fit=crop", name: "Familia García", meta: "Mesa 12 · 6 personas", badge: "Mesa cercana" },
    { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80&auto=format&fit=crop", name: "Roberto", meta: "Amigo del novio · Padrino", badge: "Te quiere conocer" },
  ],
  events: [
    { src: "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=600&q=80&auto=format&fit=crop", name: "Sofía Ramírez", meta: "VP Marketing @ Globant", badge: "Match profesional" },
    { src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80&auto=format&fit=crop", name: "Carlos Mendoza", meta: "Founder @ Lemonway · Speaker", badge: "Speaker en track 2" },
    { src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&q=80&auto=format&fit=crop", name: "Ana Torres", meta: "Head of Product @ Rappi", badge: "Quiere networking" },
    { src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop", name: "Diego Fernández", meta: "Partner @ Kaszek Ventures", badge: "Inversor confirmado" },
    { src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80&auto=format&fit=crop", name: "Laura Vega", meta: "CMO @ Mercado Libre", badge: "Match profesional" },
    { src: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&q=80&auto=format&fit=crop", name: "Sebastián López", meta: "Director RRHH · Track HR", badge: "3 intereses en común" },
    { src: "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=600&q=80&auto=format&fit=crop", name: "Valentina Cruz", meta: "Speaker · Track AI", badge: "Hablará a las 16h" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop", name: "Federico Ríos", meta: "CEO @ NotCo · Speaker keynote", badge: "Keynote 18h" },
  ],
};

export function PhoneMockup() {
  const { variant } = useVariant();
  const cards = CARDS[variant];
  const [idx, setIdx] = useState(0);

  // Preload all images for current variant on mount/variant change.
  useEffect(() => {
    cards.forEach((c) => {
      const img = new Image();
      img.src = c.src;
    });
    setIdx(0);
  }, [variant, cards]);

  // Cycle every 2.6s
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % cards.length), 2600);
    return () => clearInterval(t);
  }, [cards.length]);

  const card = cards[idx];

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto"
      style={{ width: 280, maxWidth: "100%" }}
    >
      {/* Glow detrás del phone — usa accent del variante */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(var(--v-accent-rgb), 0.45), transparent 60%), radial-gradient(circle at 70% 70%, rgba(var(--v-accent-rgb), 0.25), transparent 60%)",
          transform: "scale(1.4)",
        }}
      />

      {/* Body del phone */}
      <div
        className="relative rounded-[44px] p-2.5"
        style={{
          background: "linear-gradient(160deg, #2A2A40 0%, #0F0F1A 100%)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
          aspectRatio: "9 / 19.5",
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 rounded-full z-20"
          style={{ background: "#000" }}
        />

        {/* Pantalla */}
        <div
          className="relative w-full h-full rounded-[36px] overflow-hidden"
          style={{ background: "#07070F" }}
        >
          {/* Header */}
          <div className="px-4 pt-10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#10B981", boxShadow: "0 0 8px #10B981" }}
              />
              <span
                className="text-[9px] font-mono font-bold uppercase tracking-wider"
                style={{ color: "#10B981" }}
              >
                En vivo
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold" style={{ color: "var(--v-accent-soft)" }}>
              23:47
            </span>
          </div>

          {/* Card stack */}
          <div className="relative h-[78%] mx-3">
            {/* Card detrás */}
            <div
              className="absolute inset-x-3 top-2 bottom-12 rounded-3xl"
              style={{
                background: "#161625",
                transform: "scale(0.94) translateY(8px)",
                opacity: 0.5,
              }}
            />
            {/* Card principal con foto */}
            <div
              className="absolute inset-x-0 top-0 bottom-12 rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${variant}-${idx}`}
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                  {/* Overlay degradado */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 35%, transparent 65%)",
                    }}
                  />
                  {/* Texto del card */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles size={10} style={{ color: "var(--v-accent-soft)" }} />
                      <span
                        className="text-[8px] font-mono font-bold uppercase tracking-widest"
                        style={{ color: "var(--v-accent-soft)" }}
                      >
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-white leading-tight">
                      {card.name}
                    </h3>
                    <p className="text-[10px] text-white/85 leading-tight mt-0.5">{card.meta}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Botones */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 pb-1">
              <button
                aria-hidden
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <X size={16} className="text-white/70" />
              </button>
              <motion.button
                aria-hidden
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--v-gradient)",
                  boxShadow: "0 0 20px rgba(var(--v-accent-rgb), 0.6)",
                }}
              >
                <Heart size={20} className="text-white" fill="#fff" />
              </motion.button>
              <button
                aria-hidden
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #FFB800, #FF6B00)",
                  boxShadow: "0 0 16px rgba(255,184,0,0.5)",
                }}
              >
                <Sparkles size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Indicadores de stack */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {cards.slice(0, 4).map((_, i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full transition-all"
                style={{
                  background:
                    i === idx % 4 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
                  width: i === idx % 4 ? 8 : 4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
