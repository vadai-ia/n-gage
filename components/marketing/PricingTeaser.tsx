"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";

const PLANS = [
  { id: "spark",     emoji: "🌱", name: "Spark",     range: "Hasta 100 invitados",     accent: "#10B981" },
  { id: "vibe",      emoji: "🔥", name: "Vibe",      range: "101 – 200 invitados",     accent: "#FF2D78", popular: true },
  { id: "luxe",      emoji: "🌙", name: "Luxe",      range: "201 – 350 invitados",     accent: "#FFB800" },
  { id: "elite",     emoji: "👑", name: "Elite",     range: "351 – 500 invitados",     accent: "#7B2FBE" },
  { id: "exclusive", emoji: "💎", name: "Exclusive", range: "500+ invitados",          accent: "#1A6EFF" },
  { id: "festival",  emoji: "🎪", name: "Festivales / Masivos", range: "5,000+ invitados", accent: "#D4AF37" },
];

export function PricingTeaser() {
  return (
    <section id="precios-teaser" className="relative py-24 lg:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-30 blur-3xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,184,0,0.15), transparent 60%)" }}
      />

      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FFB800" }}>
            Planes
          </p>
          <h2 className="font-display font-bold leading-tight mb-5" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Un plan para <span className="gradient-text italic">cada tamaño</span> de evento.
          </h2>
          <p className="text-base lg:text-lg" style={{ color: "#8585A8" }}>
            Desde una boda íntima de 50 personas hasta un festival de 50,000.
            <br className="hidden sm:block" />
            Modelo simple, sin sorpresas.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-10">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.05}>
              <div
                className="relative h-full p-5 rounded-2xl transition-all duration-300 group"
                style={{
                  background: p.popular ? "rgba(255,45,120,0.08)" : "rgba(15,15,26,0.6)",
                  border: p.popular ? "1px solid rgba(255,45,120,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(20px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${p.accent}50`;
                  e.currentTarget.style.boxShadow = `0 12px 40px ${p.accent}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = p.popular ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {p.popular && (
                  <span
                    className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
                  >
                    <Sparkles size={9} /> Más popular
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none" aria-hidden>{p.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg leading-tight" style={{ color: "#F0F0FF" }}>
                      {p.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>{p.range}</p>
                    {/* TODO: confirmar precios finales con Alejandro */}
                    <p className="text-xs font-mono mt-2" style={{ color: p.accent }}>Desde $X MXN</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="text-center">
          <Link
            href="/precios"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base transition-all"
            style={{
              background: "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)",
              color: "#fff",
              boxShadow: "0 0 30px rgba(255,45,120,0.35)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Ver planes a detalle <ArrowRight size={18} />
          </Link>
          <p className="mt-4 text-xs font-mono" style={{ color: "#44445A" }}>
            Modelo de negocio en construcción · cotizaciones abiertas para todos los formatos
          </p>
        </Reveal>
      </div>
    </section>
  );
}
