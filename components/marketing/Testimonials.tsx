"use client";

/**
 * Testimonials — Variant-aware.
 * Cada variante tiene su propio set de testimonios + avatares Unsplash.
 */

import { Star } from "lucide-react";
import { Reveal } from "./Reveal";
import { useVariant } from "./VariantProvider";

type T = { quote: string; name: string; role: string; avatar: string; accent: string };

const SETS: Record<"general" | "weddings" | "events", { eyebrow: string; title: string; titleEm: string; items: T[] }> = {
  general: {
    eyebrow: "Testimonios",
    title: "Las palabras de quienes",
    titleEm: "lo vivieron",
    items: [
      {
        quote:
          "Lo que más me sorprendió fue ver a personas que llevaban toda la vida en la misma mesa salir conectados con alguien de otra. La noche tomó otra dimensión.",
        name: "María Fernanda Solís",
        role: "Wedding planner · Boda 220 invitados, CDMX",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80&auto=format&fit=crop",
        accent: "#FF2D78",
      },
      {
        quote:
          "Brandeamos toda la app con la identidad del festival. Para los patrocinadores fue un canal de activación que ningún otro evento tenía.",
        name: "Sebastián Rivera",
        role: "Productor · Festival 18,000 personas",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80&auto=format&fit=crop",
        accent: "#7B2FBE",
      },
      {
        quote:
          "Lo usamos en el kickoff anual. RH recibió un mapa de conexiones internas que cambió cómo planeamos los próximos off-sites.",
        name: "Ana Cortés",
        role: "Head of People · Off-site corporativo · 320 colaboradores",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=80&auto=format&fit=crop",
        accent: "#1A6EFF",
      },
    ],
  },
  weddings: {
    eyebrow: "Lo que dicen las parejas",
    title: "Bodas que",
    titleEm: "siguieron pasando",
    items: [
      {
        quote:
          "El miedo era que se notara la app y que perdiera magia. Pasó al revés. Mis tíos hablaron toda la noche con los amigos de mi novio. Cosa que no había pasado en 30 años.",
        name: "Sofía & Mateo",
        role: "Boda 180 invitados · Mérida",
        avatar:
          "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=160&q=80&auto=format&fit=crop",
        accent: "#D4A574",
      },
      {
        quote:
          "El álbum colectivo nos llegó al día siguiente. Tenía fotos que ni nosotros sabíamos que existían. Sigue siendo lo más bonito de nuestra boda.",
        name: "Camila & Diego",
        role: "Boda 240 invitados · Querétaro",
        avatar:
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=160&q=80&auto=format&fit=crop",
        accent: "#C9A87C",
      },
      {
        quote:
          "Tres parejas se conocieron en nuestra boda. Una se está casando el próximo verano. Es el regalo más raro y más bonito que pudimos darle a nuestros amigos.",
        name: "Isabella & Roberto",
        role: "Boda 165 invitados · Valle de Bravo",
        avatar:
          "https://images.unsplash.com/photo-1521543387324-67c2bf45fc1a?w=160&q=80&auto=format&fit=crop",
        accent: "#B5895C",
      },
    ],
  },
  events: {
    eyebrow: "Lo que dicen los organizadores",
    title: "Eventos que",
    titleEm: "convirtieron mejor",
    items: [
      {
        quote:
          "Pasamos de 'qué bien estuvo' a 'cuántos leads cerraste'. El dato de matchmaking + reuniones agendadas dentro del evento nos cambió el ROI por completo.",
        name: "Diego Fernández",
        role: "Director de Eventos · Congreso 2,400 asistentes",
        avatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&q=80&auto=format&fit=crop",
        accent: "#1A6EFF",
      },
      {
        quote:
          "Los sponsors querían visibilidad. N'GAGE les dio interacción. El siguiente año subieron de tier los tres más importantes.",
        name: "Valentina Cruz",
        role: "Head of Sponsorships · Tech summit",
        avatar:
          "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=160&q=80&auto=format&fit=crop",
        accent: "#3A85FF",
      },
      {
        quote:
          "Métricas que nuestro CFO puede entender. Cuántas conexiones, en qué tracks, con qué seguimiento. Adiós al 'la energía estuvo padrísima'.",
        name: "Federico Ríos",
        role: "VP Marketing · Off-site corporativo internacional",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80&auto=format&fit=crop",
        accent: "#7B2FBE",
      },
    ],
  },
};

export function Testimonials() {
  const { variant } = useVariant();
  const set = SETS[variant];

  return (
    <section
      data-screen-label={`05 Testimonios · ${variant}`}
      className="relative py-20 lg:py-28 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-14">
          <p className="eyebrow-v mb-5">{set.eyebrow}</p>
          <h2
            className="font-display font-bold leading-tight"
            style={{
              fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)",
              color: "var(--v-fg)",
              fontWeight: variant === "weddings" ? 500 : 700,
              letterSpacing: variant === "weddings" ? "-0.02em" : "-0.03em",
            }}
          >
            {set.title}{" "}
            <span className="gradient-text-v" style={{ fontStyle: "italic" }}>
              {set.titleEm}
            </span>
            .
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {set.items.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <article
                className="h-full p-7 rounded-3xl flex flex-col"
                style={{
                  background: "var(--v-card)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--v-line)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} fill="url(#goldStar)" stroke="none" style={{ color: "#FFB800" }} />
                  ))}
                </div>
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="goldStar" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFB800" />
                    <stop offset="100%" stopColor="#FF6B00" />
                  </linearGradient>
                </svg>

                <blockquote
                  className="font-display italic text-base lg:text-lg leading-relaxed flex-1 mb-6"
                  style={{ color: "var(--v-fg)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt=""
                    aria-hidden
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    style={{ border: `2px solid ${t.accent}40` }}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--v-fg)" }}>
                      {t.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--v-fg-2)" }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="text-center mt-10">
          <p className="text-xs font-mono" style={{ color: "var(--v-fg-3)" }}>
            Testimonios de eventos reales · Algunos nombres adaptados por privacidad.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
