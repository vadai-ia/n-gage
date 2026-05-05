"use client";

import { Star } from "lucide-react";
import { Reveal } from "./Reveal";

// TODO: Reemplazar con testimonios reales cuando estén disponibles
const TESTIMONIALS = [
  {
    quote: "Lo que más me sorprendió fue ver a personas que llevaban toda la vida en la misma mesa salir conectados con alguien de otra. La noche tomó otra dimensión.",
    name: "Wedding planner",
    role: "Boda 220 invitados · CDMX",
    initials: "WP",
    accent: "#FF2D78",
  },
  {
    quote: "Brandeamos toda la app con la identidad del festival. Para los patrocinadores fue un canal nuevo de activación que ningún otro evento tenía.",
    name: "Productor de festival",
    role: "Festival 18,000 personas · México",
    initials: "PF",
    accent: "#7B2FBE",
  },
  {
    quote: "Lo usamos en el kickoff anual. RH recibió un mapa de conexiones internas que cambió cómo planeamos los próximos off-sites.",
    name: "Head of People",
    role: "Off-site corporativo · 320 colaboradores",
    initials: "HP",
    accent: "#1A6EFF",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FFB800" }}>
            Testimonios
          </p>
          <h2 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Las palabras de quienes <span className="gradient-text italic">lo vivieron</span>.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <article
                className="h-full p-7 rounded-3xl flex flex-col"
                style={{
                  background: "rgba(15,15,26,0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.06)",
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
                  style={{ color: "#F0F0FF" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${t.accent}, ${t.accent}80)`,
                      border: `2px solid ${t.accent}30`,
                      color: "#fff",
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#F0F0FF" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "#8585A8" }}>{t.role}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="text-center mt-10">
          <p className="text-xs font-mono" style={{ color: "#44445A" }}>
            Testimonios anonimizados de eventos reales · Próximamente con casos públicos.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
