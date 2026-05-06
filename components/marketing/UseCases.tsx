"use client";

import { useVariant } from "./VariantProvider";
import { IMAGES } from "@/lib/landing/variant";

export function UseCases() {
  const { variant, content: c } = useVariant();
  const imgs = IMAGES[variant]?.cases ?? IMAGES.general.cases;

  return (
    <section id="casos-de-uso" className="section" data-screen-label="Casos">
      <div className="ng-container">
        <div className="sh reveal" style={{ textAlign: "center", margin: "0 auto 48px" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>{c.casesEyebrow}</div>
          <h2 dangerouslySetInnerHTML={{ __html: c.casesTitleHtml }} />
          <p style={{ margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: c.casesSubHtml }} />
        </div>
        <div className="cases-grid">
          {c.cases.map((cs, i) => (
            <article className="case reveal" key={cs.num} style={{ transitionDelay: `${i * 50}ms` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="case-img" src={imgs[i % imgs.length]} alt={cs.title} loading="lazy" />
              <div className="case-overlay" />
              <div className="case-content">
                <div className="case-num">{cs.num}</div>
                <h4>{cs.title}</h4>
                <div className="case-meta">{cs.meta}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
