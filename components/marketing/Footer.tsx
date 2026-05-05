"use client";

import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";

const COLUMNS = [
  {
    title: "Producto",
    links: [
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Casos de uso",   href: "#casos-de-uso" },
      { label: "Branding",       href: "#para-tu-evento" },
      { label: "Precios",        href: "/precios" },
      { label: "Solicitar demo", href: "#contacto" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre N'GAGE",   href: "#" },
      { label: "Para invitados", href: "/welcome" },
      { label: "Para anfitriones", href: "/login" },
      { label: "Para organizadores", href: "/login" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Centro de ayuda", href: "#" },
      { label: "API & Webhooks",  href: "#" },
      { label: "Estado del sistema", href: "#" },
      { label: "Contacto",        href: "#contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso de privacidad",  href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos-condiciones" },
      { label: "Política de cookies",  href: "/privacidad#cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative pt-20 pb-10 overflow-hidden border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50"
        style={{ background: "radial-gradient(ellipse at top, rgba(123,47,190,0.12), transparent 60%)" }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          {/* Brand block */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)", boxShadow: "0 0 20px rgba(255,45,120,0.35)" }}
              >
                N
              </div>
              <span className="font-display font-bold text-xl tracking-tight" style={{ color: "#F0F0FF" }}>
                N&apos;GAGE
              </span>
            </Link>
            <p className="font-display italic text-base mb-2" style={{ color: "#F0F0FF" }}>
              <span className="gradient-text font-bold">Conecta. Aquí y ahora.</span>
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#8585A8" }}>
              La plataforma de conexión social para eventos en vivo. Brandeable, efímera, inolvidable.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Instagram, href: "https://instagram.com/ngage", label: "Instagram" },
                { Icon: TikTokIcon, href: "https://tiktok.com/@ngage", label: "TikTok" },
                { Icon: Linkedin,  href: "https://linkedin.com/company/ngage", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#8585A8" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #FF2D78, #7B2FBE)";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#8585A8";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: "#FF2D78" }}>
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm transition-colors"
                        style={{ color: "#8585A8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F0FF")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#8585A8")}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "#44445A" }}
        >
          <p>© {new Date().getFullYear()} N&apos;GAGE · Todos los derechos reservados.</p>
          <p>
            Hecho con <span style={{ color: "#FF2D78" }}>❤</span> en México.
          </p>
        </div>
      </div>
    </footer>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.81a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.24z" />
    </svg>
  );
}
