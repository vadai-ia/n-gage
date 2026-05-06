"use client";

import { useVariant } from "./VariantProvider";

export function Manifesto() {
  const { content: c } = useVariant();
  return (
    <section className="section manifesto" data-screen-label="Manifesto">
      <div className="ng-container">
        <div className="reveal">
          <div className="eyebrow" style={{ marginBottom: 24 }}>
            Manifesto
          </div>
          <div className="manifesto-text">
            {c.manifestoHtml.map((line, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
            ))}
          </div>
          <div className="manifesto-sig">
            N&apos;GAGE {c.sub} · MX · 2026
          </div>
        </div>
        <div className="stat-strip" style={{ marginTop: 60 }}>
          {c.stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
