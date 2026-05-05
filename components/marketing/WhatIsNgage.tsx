"use client";

import { Clock, Camera, Palette } from "lucide-react";
import { Reveal } from "./Reveal";

const ATTRIBUTES = [
  {
    icon: Clock,
    title: "Efímero por diseño",
    body: "Las conexiones existen mientras dura el evento. Esa urgencia es lo que las hace reales.",
    color: "#FF2D78",
  },
  {
    icon: Camera,
    title: "Álbum eterno",
    body: "Los matches se acaban, pero las fotos se quedan. Cada invitado se lleva su recuerdo del evento.",
    color: "#1A6EFF",
  },
  {
    icon: Palette,
    title: "Brandeable 100%",
    body: "Tu evento, tu marca, tu mundo. N'GAGE se viste con el ADN visual de cada experiencia.",
    color: "#FFB800",
  },
];

export function WhatIsNgage() {
  return (
    <section id="que-es" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Glow ambient */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(123,47,190,0.4), transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#1A6EFF" }}>
            Qué es N&apos;GAGE
          </p>
          <h2
            className="font-display font-bold leading-tight"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#F0F0FF" }}
          >
            La primera plataforma de matching social{" "}
            <span className="gradient-text italic">event-scoped</span>: vive solo durante tu evento, se enciende con la energía del momento, y cuando termina, deja un álbum que no se borra.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {ATTRIBUTES.map((attr, i) => {
            const Icon = attr.icon;
            return (
              <Reveal key={attr.title} delay={i * 0.1}>
                <div
                  className="group relative h-full p-7 rounded-3xl transition-all duration-300"
                  style={{
                    background: "rgba(15,15,26,0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${attr.color}40`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 20px 60px ${attr.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ background: `${attr.color}15`, border: `1px solid ${attr.color}30` }}
                  >
                    <Icon size={22} style={{ color: attr.color }} />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3" style={{ color: "#F0F0FF" }}>
                    {attr.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#8585A8" }}>
                    {attr.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
