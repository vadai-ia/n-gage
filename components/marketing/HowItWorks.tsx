"use client";

import { useVariant } from "./VariantProvider";

export function HowItWorks() {
  const { variant } = useVariant();
  const steps =
    variant === "weddings"
      ? [
          { icon: "✦", title: "Brandeas tu boda", desc: "Subes invitación, paleta y nombres. La app se viste con tu identidad en minutos." },
          { icon: "◐", title: "Tus invitados escanean", desc: "QR en save-the-date o mesa. Sin descargas. Selfie del día reemplaza el avatar." },
          { icon: "◊", title: "Conectan en vivo", desc: "Mientras la fiesta avanza, ven quién es quién. Por interés, mesa o vínculo." },
          { icon: "✺", title: "El álbum eterno", desc: "Fotos colectivas, mensajes y conexiones quedan como recuerdo de tu día." },
        ]
      : variant === "events"
      ? [
          { icon: "◈", title: "Configuras el evento", desc: "Marca, agenda, segmentos. Multi-marca y multi-evento desde un dashboard." },
          { icon: "◐", title: "Asistentes hacen check-in", desc: "QR o magic link. Datos first-party. Compliance integrado (LFPDPPP, GDPR)." },
          { icon: "◊", title: "Networking medible", desc: "Matching por rol, industria e intereses. Cada interacción se registra." },
          { icon: "◇", title: "Insights al CRM", desc: "Webhook a Salesforce, HubSpot o Slack. ROI emocional cuantificado." },
        ]
      : [
          { icon: "✦", title: "Brandeas el evento", desc: "Logo, paleta, copy. La plataforma se viste con tu identidad en minutos." },
          { icon: "◐", title: "Asistentes escanean", desc: "QR o magic link. Sin descargas. Selfie del día reemplaza el avatar." },
          { icon: "◊", title: "Conectan en vivo", desc: "Matching por intereses, mesa, rol o vínculo con los anfitriones." },
          { icon: "✺", title: "Mides cada conexión", desc: "Dashboard en vivo. Métricas de engagement. Album colectivo." },
        ];

  return (
    <section className="section" id="how" data-screen-label="Cómo funciona">
      <div className="ng-container">
        <div className="sh reveal" style={{ textAlign: "center", margin: "0 auto 48px" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>Cómo funciona</div>
          <h2>
            Cuatro pasos. <em>Cero <span className="accent-underline">fricción</span>.</em>
          </h2>
          <p>
            Diseñado para que la <span className="accent">magia</span> ocurra sin que nadie lo note. Listo en{" "}
            <span className="accent">48 horas</span>.
          </p>
        </div>
        <div className="flow-diagram reveal">
          <div className="flow-line" />
          <div className="flow-node active">01</div>
          <div className="flow-node">02</div>
          <div className="flow-node">03</div>
          <div className="flow-node">04</div>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="step-num">0{i + 1} / 04</span>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
