"use client";

/**
 * PreFooter — Pull-quote previo al ContactForm.
 * Cierre emocional con highlights de color por variante.
 */

import { Reveal } from "./Reveal";
import { useVariant } from "./VariantProvider";

export function PreFooter() {
  const { variant, content } = useVariant();

  return (
    <section
      data-screen-label={`PreFooter · ${variant}`}
      className="relative py-20 lg:py-28"
    >
      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <Reveal>
          <blockquote
            className="font-display text-center"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 3.25rem)",
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
              fontStyle: "italic",
              fontWeight: variant === "weddings" ? 400 : 500,
              color: "var(--v-fg)",
            }}
            dangerouslySetInnerHTML={{ __html: content.pullquoteHtml }}
          />
        </Reveal>
      </div>
    </section>
  );
}
