import { useState } from "react";

const plans = [
  {
    id: "spark",
    name: "Spark",
    tagline: "Para reuniones íntimas",
    emoji: "✨",
    guests: "Hasta 50 invitados",
    guestMax: 50,
    price: 3500,
    events: ["Fiestas en casa", "Reuniones de amigos", "Cumpleaños pequeños"],
    features: [
      { label: "Hasta 50 solteros en el evento", included: true },
      { label: "Timer configurable (máx 1 hora)", included: true },
      { label: "10 fotos por invitado en álbum", included: true },
      { label: "Chat entre matches", included: true },
      { label: "QR personalizado del evento", included: true },
      { label: "1 Anfitrión del evento", included: true },
      { label: "Acceso al álbum 24h después", included: true },
      { label: "Caducidad configurable", included: false },
      { label: "Precarga de invitados CSV", included: false },
      { label: "Webhooks y API access", included: false },
      { label: "Soporte prioritario", included: false },
    ],
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.3)",
    popular: false,
  },
  {
    id: "connect",
    name: "Connect",
    tagline: "El favorito para fiestas",
    emoji: "💫",
    guests: "51 – 100 invitados",
    guestMax: 100,
    price: 6500,
    events: ["Quinceañeras", "Bautizos", "Cumpleaños grandes"],
    features: [
      { label: "Hasta 100 solteros en el evento", included: true },
      { label: "Timer configurable (máx 2 horas)", included: true },
      { label: "10 fotos por invitado en álbum", included: true },
      { label: "Chat entre matches", included: true },
      { label: "QR personalizado del evento", included: true },
      { label: "2 Anfitriones del evento", included: true },
      { label: "Acceso al álbum 24h después", included: true },
      { label: "Caducidad configurable", included: true },
      { label: "Precarga de invitados CSV", included: false },
      { label: "Webhooks y API access", included: false },
      { label: "Soporte prioritario", included: false },
    ],
    color: "#FB7185",
    glow: "rgba(251,113,133,0.3)",
    popular: false,
  },
  {
    id: "vibe",
    name: "Vibe",
    tagline: "El más popular",
    emoji: "🔥",
    guests: "101 – 200 invitados",
    guestMax: 200,
    price: 10000,
    events: ["Bodas medianas", "Graduaciones", "Eventos corporativos"],
    features: [
      { label: "Hasta 200 solteros en el evento", included: true },
      { label: "Timer configurable (máx 3 horas)", included: true },
      { label: "10 fotos por invitado en álbum", included: true },
      { label: "Chat entre matches", included: true },
      { label: "QR personalizado del evento", included: true },
      { label: "3 Anfitriones del evento", included: true },
      { label: "Acceso al álbum 24h después", included: true },
      { label: "Caducidad configurable", included: true },
      { label: "Precarga de invitados CSV", included: true },
      { label: "Webhooks y API access", included: false },
      { label: "Soporte prioritario", included: false },
    ],
    color: "#FF2D78",
    glow: "rgba(255,60,172,0.4)",
    popular: true,
  },
  {
    id: "luxe",
    name: "Luxe",
    tagline: "Para eventos memorables",
    emoji: "💎",
    guests: "201 – 350 invitados",
    guestMax: 350,
    price: 15000,
    events: ["Bodas grandes", "Eventos de lujo", "Graduaciones masivas"],
    features: [
      { label: "Hasta 350 solteros en el evento", included: true },
      { label: "Timer configurable (sin límite)", included: true },
      { label: "10 fotos por invitado en álbum", included: true },
      { label: "Chat entre matches", included: true },
      { label: "QR personalizado del evento", included: true },
      { label: "3 Anfitriones del evento", included: true },
      { label: "Acceso al álbum 24h después", included: true },
      { label: "Caducidad configurable", included: true },
      { label: "Precarga de invitados CSV", included: true },
      { label: "Webhooks y API access", included: true },
      { label: "Soporte prioritario", included: false },
    ],
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.35)",
    popular: false,
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Exclusivo y sin límites",
    emoji: "👑",
    guests: "351 – 500 invitados",
    guestMax: 500,
    price: 22000,
    events: ["Bodas exclusivas", "Cruceros", "Conciertos privados"],
    features: [
      { label: "Hasta 500 solteros en el evento", included: true },
      { label: "Timer configurable (sin límite)", included: true },
      { label: "10 fotos por invitado en álbum", included: true },
      { label: "Chat entre matches", included: true },
      { label: "QR personalizado del evento", included: true },
      { label: "3 Anfitriones del evento", included: true },
      { label: "Acceso al álbum 24h después", included: true },
      { label: "Caducidad configurable", included: true },
      { label: "Precarga de invitados CSV", included: true },
      { label: "Webhooks y API access", included: true },
      { label: "Soporte prioritario", included: true },
    ],
    color: "#1A6EFF",
    glow: "rgba(43,134,197,0.35)",
    popular: false,
  },
  {
    id: "exclusive",
    name: "Exclusive",
    tagline: "Cotización personalizada",
    emoji: "🌟",
    guests: "500+ invitados",
    guestMax: 9999,
    price: null,
    events: ["Eventos masivos", "Festivales", "Corporativos a gran escala"],
    features: [
      { label: "Invitados ilimitados", included: true },
      { label: "Timer configurable (sin límite)", included: true },
      { label: "Fotos ilimitadas por invitado", included: true },
      { label: "Chat entre matches", included: true },
      { label: "QR múltiples por evento", included: true },
      { label: "Anfitriones ilimitados", included: true },
      { label: "Acceso al álbum 24h después", included: true },
      { label: "Caducidad configurable", included: true },
      { label: "Precarga de invitados CSV", included: true },
      { label: "Webhooks y API access", included: true },
      { label: "Soporte prioritario 24/7", included: true },
    ],
    color: "url(#exclusiveGrad)",
    glow: "rgba(255,60,172,0.5)",
    popular: false,
    isExclusive: true,
  },
];

export default function NGAGEPricing() {
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("vibe");

  const formatPrice = (price) => {
    if (!price) return null;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      style={{
        background: "#080810",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "60px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(255,60,172,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(43,134,197,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div style={{
          display: "inline-block",
          background: "linear-gradient(135deg, rgba(255,60,172,0.15), rgba(120,75,160,0.15))",
          border: "1px solid rgba(255,60,172,0.3)",
          borderRadius: "100px",
          padding: "6px 20px",
          marginBottom: "20px",
        }}>
          <span style={{ color: "#FF2D78", fontSize: "13px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase" }}>
            Planes N'GAGE
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: "800",
          background: "linear-gradient(135deg, #fff 0%, #FF2D78 50%, #7B2FBE 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          margin: "0 0 16px",
          lineHeight: 1.1,
        }}>
          Conecta en cada evento
        </h1>
        <p style={{ color: "#8888AA", fontSize: "18px", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
          Elige el plan según el tamaño de tu evento. Sin suscripciones, sin sorpresas — pagas solo por lo que necesitas.
        </p>
      </div>

      {/* Plans grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}>
        {plans.map((plan) => {
          const isHovered = hoveredPlan === plan.id;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                position: "relative",
                background: isSelected
                  ? "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
                  : "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                border: isSelected
                  ? `1px solid ${plan.color === "url(#exclusiveGrad)" ? "#FF2D78" : plan.color}`
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "24px",
                padding: "32px 24px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                boxShadow: isSelected
                  ? `0 20px 60px ${plan.glow}, 0 0 0 1px ${plan.color === "url(#exclusiveGrad)" ? "rgba(255,60,172,0.3)" : plan.color + "44"}`
                  : isHovered
                  ? `0 10px 40px ${plan.glow}`
                  : "none",
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div style={{
                  position: "absolute",
                  top: "-14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                  borderRadius: "100px",
                  padding: "5px 18px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#fff",
                  letterSpacing: "1px",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}>
                  ⭐ Más popular
                </div>
              )}

              {/* Emoji + name */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>{plan.emoji}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: "800",
                    color: plan.isExclusive ? "transparent" : plan.color,
                    background: plan.isExclusive
                      ? "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)"
                      : "none",
                    WebkitBackgroundClip: plan.isExclusive ? "text" : "unset",
                    WebkitTextFillColor: plan.isExclusive ? "transparent" : "unset",
                    backgroundClip: plan.isExclusive ? "text" : "unset",
                  }}>
                    {plan.name}
                  </h2>
                  <span style={{ color: "#666688", fontSize: "13px" }}>{plan.tagline}</span>
                </div>
              </div>

              {/* Guest count pill */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "100px",
                padding: "5px 14px",
                marginBottom: "24px",
              }}>
                <span style={{ fontSize: "14px" }}>👥</span>
                <span style={{ color: "#ccc", fontSize: "13px", fontWeight: "600" }}>{plan.guests}</span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "24px" }}>
                {plan.price ? (
                  <>
                    <div style={{
                      fontSize: "42px",
                      fontWeight: "900",
                      color: "#fff",
                      lineHeight: 1,
                      letterSpacing: "-1px",
                    }}>
                      {formatPrice(plan.price)}
                    </div>
                    <div style={{ color: "#666688", fontSize: "13px", marginTop: "4px" }}>
                      pago único por evento
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontSize: "28px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #FF2D78, #1A6EFF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    Cotización especial
                  </div>
                )}
              </div>

              {/* Event types */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ color: "#666688", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                  Ideal para
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {plan.events.map((ev) => (
                    <span key={ev} style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "6px",
                      padding: "3px 10px",
                      fontSize: "12px",
                      color: "#aaa",
                    }}>
                      {ev}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {plan.features.map((f) => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: f.included
                        ? `${plan.color === "url(#exclusiveGrad)" ? "#FF2D78" : plan.color}22`
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${f.included
                        ? (plan.color === "url(#exclusiveGrad)" ? "#FF2D78" : plan.color) + "55"
                        : "rgba(255,255,255,0.08)"}`,
                    }}>
                      <span style={{ fontSize: "10px" }}>
                        {f.included ? "✓" : "×"}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "13px",
                      color: f.included ? "#CCCCDD" : "#444455",
                      textDecoration: f.included ? "none" : "none",
                    }}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                letterSpacing: "0.5px",
                transition: "all 0.2s ease",
                background: isSelected
                  ? plan.isExclusive
                    ? "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)"
                    : plan.color
                  : "rgba(255,255,255,0.06)",
                color: isSelected ? "#fff" : "#888899",
                border: isSelected ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}>
                {plan.isExclusive ? "Solicitar cotización" : "Seleccionar plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{
        textAlign: "center",
        marginTop: "60px",
        padding: "32px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "20px",
        maxWidth: "700px",
        margin: "60px auto 0",
      }}>
        <div style={{ fontSize: "24px", marginBottom: "12px" }}>💡</div>
        <h3 style={{ color: "#fff", margin: "0 0 8px", fontSize: "18px", fontWeight: "700" }}>
          ¿No sabes cuántos solteros habrá?
        </h3>
        <p style={{ color: "#666688", fontSize: "14px", margin: 0, lineHeight: 1.7 }}>
          El conteo es solo de los invitados que se registren como solteros — no del total de asistentes al evento.
          Puedes estimar entre un <strong style={{ color: "#FF2D78" }}>30% y 40%</strong> del total de invitados.
          Siempre puedes contactarnos para orientarte en el plan correcto.
        </p>
      </div>

      {/* Comparison footer */}
      <div style={{
        display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap",
        marginTop: "40px",
      }}>
        {[
          { icon: "🔒", text: "Acceso solo por QR o link único" },
          { icon: "⏱️", text: "Timer configurable por evento" },
          { icon: "📸", text: "Álbum disponible al día siguiente" },
          { icon: "💳", text: "Pago único, sin suscripciones" },
        ].map((item) => (
          <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>{item.icon}</span>
            <span style={{ color: "#666688", fontSize: "13px" }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
