"use client";

import { useEffect, useState } from "react";
import { useVariant } from "./VariantProvider";
import { Magnetic } from "./Magnetic";
import { captureUtmFromUrl, readStoredUtm } from "@/lib/landing/utm";

const SIZES = [
  { label: "< 100", v: "s_lt_100" },
  { label: "100 – 300", v: "s_100_250" },
  { label: "300 – 800", v: "s_250_500" },
  { label: "800 – 2K", v: "s_500_2k" },
  { label: "2K+", v: "s_2k_10k" },
] as const;

const TYPE_TO_BACKEND: Record<string, string> = {
  Boda: "wedding",
  "XV años": "quinceanera",
  Aniversario: "private_party",
  Compromiso: "private_party",
  Festival: "festival",
  Corporativo: "corporate",
  Deportivo: "sports",
  "Branded activation": "corporate",
  Conferencia: "corporate",
  Crucero: "cruise_hotel",
  Otro: "other",
};

export function ContactForm() {
  const { variant, content: c } = useVariant();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    type: "",
    sizeLabel: "",
    sizeBackend: "",
    date: "",
    name: "",
    email: "",
    phone: "",
  });
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    const captured = captureUtmFromUrl();
    const stored = readStoredUtm();
    setUtm({ ...stored, ...captured });
  }, []);

  async function onSubmit() {
    if (!data.name || !data.email || !data.phone) return;
    setSubmitState("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          event_type: TYPE_TO_BACKEND[data.type] ?? "other",
          event_type_other: TYPE_TO_BACKEND[data.type] ? "" : data.type,
          event_size: data.sizeBackend || "s_lt_100",
          event_date: data.date,
          referral_source: `landing-${variant}`,
          newsletter_opt_in: false,
          privacy_accepted: true,
          ...utm,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al enviar");
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
    }
  }

  return (
    <section id="contacto" className="section" data-screen-label="Contacto">
      <div className="ng-container" style={{ maxWidth: 720 }}>
        <div className="sh reveal" style={{ textAlign: "center", margin: "0 auto 32px" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Hablemos</div>
          <h2>
            Tres pasos. <em>Una <span className="accent-underline">conversación</span>.</em>
          </h2>
        </div>
        <div className="form-shell reveal">
          <div className="form-stepper">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`step-bar ${step > i || submitState === "success" ? "done" : step === i ? "active" : ""}`}
              />
            ))}
          </div>

          {submitState === "success" ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div className="form-step-label">¡Listo!</div>
              <div className="form-step-title">Te contactamos en menos de 24h.</div>
              <p style={{ color: "var(--fg-2)", marginTop: 12 }}>
                <span className="accent">Lo que pase después</span>, ya es entre nosotros.
              </p>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div>
                  <div className="form-step-label">Paso 01 / 03</div>
                  <div className="form-step-title">¿Qué tipo de evento?</div>
                  <div className="form-step-sub">Selecciona el más cercano.</div>
                  <div className="chips">
                    {c.formTypes.map((t) => (
                      <button
                        key={t}
                        className={`chip ${data.type === t ? "active" : ""}`}
                        onClick={() => setData({ ...data, type: t })}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="form-nav">
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        color: "var(--fg-3)",
                        textTransform: "uppercase",
                      }}
                    >
                      1 de 3
                    </span>
                    <button
                      className="btn btn-primary"
                      onClick={() => data.type && setStep(1)}
                      style={{ opacity: data.type ? 1 : 0.4 }}
                    >
                      Siguiente <span className="arrow">→</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="form-step-label">Paso 02 / 03</div>
                  <div className="form-step-title">¿Cuántos invitados? ¿Cuándo?</div>
                  <div className="form-step-sub">Aproximaciones son bienvenidas.</div>
                  <div className="field">
                    <label className="field-label">Tamaño aproximado</label>
                    <div className="chips">
                      {SIZES.map((s) => (
                        <button
                          key={s.v}
                          className={`chip ${data.sizeLabel === s.label ? "active" : ""}`}
                          onClick={() => setData({ ...data, sizeLabel: s.label, sizeBackend: s.v })}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Fecha tentativa</label>
                    <input
                      className="field-input"
                      placeholder="Octubre 2026"
                      value={data.date}
                      onChange={(e) => setData({ ...data, date: e.target.value })}
                    />
                  </div>
                  <div className="form-nav">
                    <button className="btn btn-ghost" onClick={() => setStep(0)}>← Atrás</button>
                    <button className="btn btn-primary" onClick={() => setStep(2)}>
                      Siguiente <span className="arrow">→</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="form-step-label">Paso 03 / 03</div>
                  <div className="form-step-title">¿Cómo te llamamos?</div>
                  <div className="form-step-sub">Respuesta en menos de 24h hábiles.</div>
                  <div className="field">
                    <label className="field-label">Nombre</label>
                    <input
                      className="field-input"
                      placeholder="Tu nombre"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input
                      className="field-input"
                      placeholder="tu@email.com"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">WhatsApp</label>
                    <input
                      className="field-input"
                      placeholder="+52 55 ..."
                      value={data.phone}
                      onChange={(e) => setData({ ...data, phone: e.target.value })}
                    />
                  </div>
                  {submitState === "error" && (
                    <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>
                      {errorMsg ?? "Algo salió mal."}
                    </p>
                  )}
                  <div className="form-nav">
                    <button className="btn btn-ghost" onClick={() => setStep(1)}>← Atrás</button>
                    <Magnetic>
                      <button className="btn btn-primary" onClick={onSubmit} disabled={submitState === "loading"}>
                        {submitState === "loading" ? "Enviando…" : (<>Enviar <span className="arrow">→</span></>)}
                      </button>
                    </Magnetic>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
