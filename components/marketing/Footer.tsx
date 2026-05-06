"use client";

import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { useVariant } from "./VariantProvider";

const COLUMNS = [
  {
    title: "Producto",
    links: [
      { label: "Cómo funciona",       href: "#como-funciona" },
      { label: "Casos de uso",        href: "#casos-de-uso" },
      { label: "Branding",            href: "#para-tu-evento" },
      { label: "Precios",             href: "/precios" },
      { label: "Solicitar demo",      href: "#contacto" },
    ],
  },
  {
    title: "Variantes",
    links: [
      { label: "N'GAGE general",      href: "/" },
      { label: "/ Weddings",          href: "/bodas" },
      { label: "/ Events",            href: "/eventos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Para invitados",      href: "/welcome" },
      { label: "Para anfitriones",    href: "/login" },
      { label: "Para organizadores",  href: "/login" },
      { label: "Contacto",            href: "#contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso de privacidad",   href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos-condiciones" },
      { label: "Política de cookies",    href: "/privacidad#cookies" },
    ],
  },
];

export function Footer() {
  const { content } = useVariant();

  return (
    <footer
      className="relative pt-20 pb-10 overflow-hidden"
      style={{ borderTop: "1px solid var(--v-line)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(var(--v-accent-rgb), 0.10), transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                style={{
                  background: "var(--v-gradient)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(var(--v-accent-rgb), 0.35)",
                }}
              >
                N
              </div>
              <span
                className="font-display font-bold text-xl tracking-tight"
                style={{ color: "var(--v-fg)" }}
              >
                N&apos;GAGE
                {content.sub && (
                  <span
                    className="font-mono ml-1.5"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      color: "var(--v-fg-3)",
                    }}
                  >
                    {content.sub}
                  </span>
                )}
              </span>
            </Link>
            <p className="font-display italic text-base mb-2" style={{ color: "var(--v-fg)" }}>
              <span className="gradient-text-v font-bold">Conecta. Aquí y ahora.</span>
            </p>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--v-fg-2)" }}
            >
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
                  style={{
                    background: "var(--v-bg-2)",
                    border: "1px solid var(--v-line)",
                    color: "var(--v-fg-3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--v-gradient)";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--v-bg-2)";
                    e.currentTarget.style.color = "var(--v-fg-3)";
                    e.currentTarget.style.borderColor = "var(--v-line)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4
                  className="text-[11px] font-mono font-bold uppercase tracking-widest mb-4"
                  style={{ color: "var(--v-accent)" }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm transition-colors"
                        style={{ color: "var(--v-fg-2)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--v-fg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v-fg-2)")}
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
          style={{ borderTop: "1px solid var(--v-line)", color: "var(--v-fg-3)" }}
        >
          <p>© {new Date().getFullYear()} N&apos;GAGE · Todos los derechos reservados.</p>
          <p>
            Hecho con <span style={{ color: "var(--v-accent)" }}>❤</span> en CDMX.
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
