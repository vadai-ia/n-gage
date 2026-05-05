"use client";

import { Briefcase, Crown, UserCheck, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type Audience = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  bullets: string[];
  color: string;
};

const AUDIENCES: Audience[] = [
  {
    icon: Briefcase,
    title: "Para el organizador",
    subtitle: "Wedding planner · productora · agencia",
    bullets: [
      "Diferenciación inmediata vs competencia",
      "Servicio premium con margen alto",
      "Setup en 24h, sin código",
      "Reportes y métricas para tu cliente",
    ],
    color: "#FF2D78",
  },
  {
    icon: Crown,
    title: "Para el anfitrión",
    subtitle: "Los novios · la quinceañera · la marca",
    bullets: [
      "Tu evento se convierte en tema de conversación",
      "Álbum colectivo para siempre",
      "Posibilidades de patrocinio y co-branding",
      "Vives el evento sabiendo que algo está pasando",
    ],
    color: "#FFB800",
  },
  {
    icon: UserCheck,
    title: "Para los invitados",
    subtitle: "Quien escanea, conecta y vive",
    bullets: [
      "Cero apps que descargar",
      "Privacidad respetada (todo es event-scoped)",
      "Conexiones reales en el momento real",
      "Recuerdos que no caducan",
    ],
    color: "#1A6EFF",
  },
  {
    icon: Megaphone,
    title: "Para la marca o patrocinador",
    subtitle: "Activaciones medibles · datos first-party",
    bullets: [
      "Engagement orgánico (no interrupción)",
      "Impresiones de marca en cada interacción",
      "Data first-party de comportamiento",
      "Activaciones medibles y replicables",
    ],
    color: "#7B2FBE",
  },
];

export function Benefits() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#7B2FBE" }}>
            Beneficios
          </p>
          <h2 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Cuatro audiencias. Una sola plataforma.{" "}
            <span className="gradient-text italic">Cero compromisos</span>.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-5">
          {AUDIENCES.map((a, i) => {
            const Icon = a.icon;
            return (
              <Reveal key={a.title} delay={(i % 2) * 0.1}>
                <div
                  className="group relative h-full p-7 lg:p-8 rounded-3xl transition-all duration-300"
                  style={{
                    background: "rgba(15,15,26,0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${a.color}40`;
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${a.color}15`, border: `1px solid ${a.color}30` }}
                    >
                      <Icon size={22} style={{ color: a.color }} strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl mb-1" style={{ color: "#F0F0FF" }}>
                        {a.title}
                      </h3>
                      <p className="text-xs font-mono uppercase tracking-wider" style={{ color: a.color }}>
                        {a.subtitle}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {a.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm" style={{ color: "#8585A8" }}>
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: a.color }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
