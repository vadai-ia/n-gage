"use client";

import { useState } from "react";
import { useVariant } from "./VariantProvider";
import { Magnetic } from "./Magnetic";
import { PRICING } from "@/lib/landing/variant";
import { PricingModal } from "./PricingModal";

export function PricingTeaser() {
  const { variant } = useVariant();
  const [modalOpen, setModalOpen] = useState(false);

  if (variant === "events") {
    return (
      <>
        <section className="section" id="precios" data-screen-label="Pricing">
          <div className="ng-container">
            <div className="sh reveal" style={{ textAlign: "center", margin: "0 auto 40px" }}>
              <div className="eyebrow" style={{ justifyContent: "center" }}>Pricing enterprise</div>
              <h2>
                Cotización <em>a la <span className="accent-underline">medida</span>.</em>
              </h2>
              <p style={{ margin: "0 auto" }}>
                Multi-evento, multi-marca, multi-integración. Cada propuesta se construye desde{" "}
                <span className="accent">tu stack</span>.
              </p>
            </div>
            <div className="calc reveal" style={{ textAlign: "center", padding: "60px 40px" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(40px, 6vw, 72px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  marginBottom: 16,
                  color: "var(--fg)",
                }}
              >
                <span className="gradient-text">Hablemos</span> de tu evento.
              </div>
              <p style={{ color: "var(--fg-2)", fontSize: 17, maxWidth: 540, margin: "0 auto 32px" }}>
                Plan modular: por seats, por eventos por año, add-ons (SLA, white-label, integraciones custom).
                Propuesta detallada en 48h.
              </p>
              <Magnetic>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                  Solicita propuesta <span className="arrow">→</span>
                </button>
              </Magnetic>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                  marginTop: 48,
                  textAlign: "left",
                  maxWidth: 720,
                  margin: "48px auto 0",
                }}
              >
                {[
                  { t: "Compliance", d: "SOC 2 ready · LFPDPPP · GDPR · DPA disponible" },
                  { t: "Integraciones", d: "Salesforce · HubSpot · Slack · webhooks custom" },
                  { t: "SLA", d: "99.9% uptime · CSM dedicado · response 1h" },
                ].map((it, i) => (
                  <div key={i} style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 14 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--accent-lead)",
                        marginBottom: 6,
                      }}
                    >
                      {it.t}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--fg-2)" }}>{it.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {modalOpen && <PricingModal onClose={() => setModalOpen(false)} />}
      </>
    );
  }

  const tiers = PRICING[variant] ?? PRICING.general;
  return (
    <>
      <section className="section" id="precios" data-screen-label="Pricing">
        <div className="ng-container">
          <div className="sh reveal" style={{ textAlign: "center", margin: "0 auto 40px" }}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Planes transparentes</div>
            <h2>
              Elige tu <em><span className="accent-underline">plan</span>.</em>
            </h2>
            <p style={{ margin: "0 auto" }}>
              Precios por evento, <span className="accent">sin cuotas mensuales</span>. Lo que ves, es lo que pagas.
            </p>
          </div>
          <div
            className="tiers reveal"
            style={{ gridTemplateColumns: tiers.length === 4 ? "repeat(4, 1fr)" : "repeat(3, 1fr)" }}
          >
            {tiers.map((t, i) => (
              <div className={`tier ${t.featured ? "featured" : ""}`} key={i}>
                {t.badge && <span className="tier-badge">{t.badge}</span>}
                <div className="tier-name">{t.name}</div>
                <div className="tier-cap">{t.cap}</div>
                <div className="tier-price">
                  <span className="tier-price-cur">MXN $</span>
                  <span className="tier-price-num">{t.price.toLocaleString("es-MX")}</span>
                </div>
                <div className="tier-price-cycle">por evento · IVA incluido</div>
                <ul className="tier-features">
                  {t.features.map((f, j) => (
                    <li className="tier-feat" key={j}>
                      <span className="check">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${t.featured ? "btn-primary" : "btn-ghost"} tier-cta`}
                  onClick={() => setModalOpen(true)}
                >
                  {t.featured ? "Reservar" : "Ver detalles"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      {modalOpen && <PricingModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
