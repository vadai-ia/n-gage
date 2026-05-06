"use client";

import { useState } from "react";
import { useVariant } from "./VariantProvider";

export function PricingModal({ onClose }: { onClose: () => void }) {
  const { variant } = useVariant();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function send() {
    if (!email && !phone) return;
    setSubmitting(true);
    try {
      // Persistencia mínima: usa el endpoint de leads con datos parciales.
      // Si falla, igual cerramos con éxito visual (es modal de captura simple).
      await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: "Pricing modal",
          email: email || "sin-email@ngage.com.mx",
          phone: phone || "sin-telefono",
          event_type: variant === "weddings" ? "wedding" : variant === "events" ? "corporate" : "other",
          event_size: "s_lt_100",
          source: `pricing-modal-${variant}`,
          privacy_accepted: true,
          newsletter_opt_in: false,
        }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => onClose(), 1400);
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="eyebrow">Confirmación</div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginTop: 12,
            marginBottom: 12,
            color: "var(--fg)",
          }}
        >
          {submitted ? "¡Listo! Te contactamos pronto." : "Hablemos de tu evento."}
        </h3>
        {!submitted && (
          <>
            <p style={{ color: "var(--fg-2)", fontSize: 15, marginBottom: 24 }}>
              {variant === "events"
                ? "Te enviamos una propuesta enterprise detallada en menos de 48h hábiles."
                : "Confirmamos disponibilidad y cerramos detalles en una llamada de 20 minutos."}
            </p>
            <input
              className="field-input"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <input
              className="field-input"
              placeholder="WhatsApp (+52 ...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={send}
              disabled={submitting}
            >
              {submitting ? "Enviando…" : (<>Enviar <span className="arrow">→</span></>)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
