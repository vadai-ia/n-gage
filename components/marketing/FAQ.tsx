"use client";

import { useState } from "react";
import { useVariant } from "./VariantProvider";

export function FAQ() {
  const { content: c } = useVariant();
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="section" data-screen-label="FAQ">
      <div className="ng-container">
        <div className="sh reveal" style={{ textAlign: "center", margin: "0 auto 40px" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>FAQ</div>
          <h2>
            Las preguntas <em>de <span className="accent-underline">siempre</span>.</em>
          </h2>
        </div>
        <div className="faq-list">
          {c.faqs.map((it, i) => (
            <div
              key={i}
              className={`faq-item ${openIdx === i ? "open" : ""} reveal in`}
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
            >
              <div className="faq-q">
                {it.q}
                <span className="plus">+</span>
              </div>
              <div className="faq-a">{it.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
