"use client";

import { useVariant } from "./VariantProvider";
import { IMAGES } from "@/lib/landing/variant";

export function BrandingShowcase() {
  const { variant, content: c } = useVariant();
  const photos = IMAGES[variant]?.branding ?? IMAGES.general.branding;

  return (
    <section id="para-tu-evento" className="section" data-screen-label="Branding">
      <div className="ng-container">
        <div className="brand-showcase">
          <div className="reveal">
            <div className="eyebrow">Brandeable end-to-end</div>
            <h2
              style={{
                fontFamily: "var(--display-priority)",
                fontWeight: variant === "weddings" ? 500 : 600,
                fontSize: "clamp(36px, 5.5vw, 60px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: "16px 0",
                color: "var(--fg)",
              }}
              dangerouslySetInnerHTML={{ __html: c.brandingTitleHtml }}
            />
            <p style={{ color: "var(--fg-2)", fontSize: 17, marginBottom: 24, maxWidth: 480 }}>
              {c.brandingDesc}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {c.brandingChips.map((b, i) => (
                <span
                  key={i}
                  style={{
                    padding: "7px 13px",
                    border: "1px solid var(--line-2)",
                    borderRadius: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    color: "var(--fg-2)",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="reveal">
            <div className="brand-photos">
              {photos.slice(0, 4).map((src, i) => (
                <div className="brand-photo" key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
