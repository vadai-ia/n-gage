"use client";

import { useVariant } from "./VariantProvider";
import { IMAGES } from "@/lib/landing/variant";

export function Testimonials() {
  const { variant, content: c } = useVariant();
  const avs = IMAGES[variant]?.avatars ?? IMAGES.general.avatars;
  return (
    <section className="section" data-screen-label="Testimonios">
      <div className="ng-container">
        <div className="sh reveal" style={{ textAlign: "center", margin: "0 auto 48px" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Voces reales</div>
          <h2>
            Lo que dicen <em>quienes <span className="accent-underline">ya lo vivieron</span>.</em>
          </h2>
        </div>
        <div className="testimonials">
          {c.testimonials.map((t, i) => (
            <article className="testimonial reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="testimonial-quote">&ldquo;{t.q}&rdquo;</div>
              <div className="testimonial-author">
                <div className="testimonial-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avs[i % avs.length]} alt="" loading="lazy" />
                </div>
                <div className="testimonial-meta">
                  <div className="testimonial-name">{t.n}</div>
                  <div className="testimonial-role">{t.r}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
