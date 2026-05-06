"use client";

import Link from "next/link";
import { useVariant } from "./VariantProvider";

export function Footer() {
  const { content: c } = useVariant();
  return (
    <footer className="footer">
      <div className="ng-container">
        <div className="footer-grid">
          <div>
            <div className="footer-wordmark">
              N<span style={{ color: "var(--accent-lead)" }}>&apos;</span>GAGE
              {c.sub && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    marginLeft: 6,
                    color: "var(--fg-3)",
                  }}
                >
                  {c.sub}
                </span>
              )}
            </div>
            <p className="footer-tagline">
              La infraestructura social de los eventos en vivo. Hecho en México.
            </p>
          </div>
          <div className="footer-col">
            <h5>Producto</h5>
            <Link href="/">General</Link>
            <Link href="/bodas">Weddings</Link>
            <Link href="/eventos">Events</Link>
            <Link href="/precios">Pricing</Link>
          </div>
          <div className="footer-col">
            <h5>Empresa</h5>
            <Link href="#">Manifesto</Link>
            <Link href="#casos-de-uso">Casos</Link>
            <Link href="#">Prensa</Link>
            <Link href="#contacto">Contacto</Link>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos-condiciones">Términos</Link>
            <Link href="/privacidad#cookies">DPA</Link>
            <Link href="/privacidad">LFPDPPP</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 N&apos;GAGE · MX</span>
          <span>Hecho con cuidado en CDMX</span>
        </div>
      </div>
    </footer>
  );
}
