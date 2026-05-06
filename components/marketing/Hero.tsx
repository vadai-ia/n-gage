"use client";

import { useVariant } from "./VariantProvider";
import { Magnetic } from "./Magnetic";
import { PhoneMockup } from "./PhoneMockup";
import { ParticleField } from "./ParticleField";

export function Hero() {
  const { variant, content: c } = useVariant();
  return (
    <section className="hero" data-screen-label={`Hero · ${variant}`}>
      <div className="aurora">
        <div className="aurora-blob b1" />
        <div className="aurora-blob b2" />
        <div className="aurora-blob b3" />
        <ParticleField />
      </div>
      <div className="ng-container">
        <div className="hero-grid">
          <div className="reveal in">
            <div className="eyebrow">{c.eyebrow}</div>
            <h1>
              {c.h1Pre}{" "}
              <em>{c.h1Em}</em>{" "}
              <span className="gradient-text">{c.h1Post}</span>
            </h1>
            <p
              className="lede"
              dangerouslySetInnerHTML={{ __html: c.ledeHtml }}
            />
            <div className="hero-ctas">
              <Magnetic>
                <a href="#contacto" className="btn btn-primary">
                  {c.cta1} <span className="arrow">→</span>
                </a>
              </Magnetic>
              <a href="#how" className="btn btn-ghost">
                {c.cta2}
              </a>
            </div>
            <div className="hero-meta">
              {c.heroMeta.map((m) => (
                <div className="hero-meta-item" key={m.label}>
                  <div className="hero-meta-num">{m.num}</div>
                  <div className="hero-meta-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal in" style={{ position: "relative" }}>
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
