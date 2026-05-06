"use client";

import { useEffect, useState } from "react";
import { useVariant } from "./VariantProvider";
import { PHONE_PROFILES } from "@/lib/landing/variant";

export function PhoneMockup() {
  const { variant } = useVariant();
  const list = PHONE_PROFILES[variant] ?? PHONE_PROFILES.general;
  const [idx, setIdx] = useState(0);
  const profile = list[idx % list.length];
  const isWed = variant === "weddings";
  const screenBg = isWed ? "#FAFAF6" : variant === "events" ? "#0A1024" : "#0F0F1A";
  const fg = isWed ? "#1A140E" : "#F0F0FF";
  const fg2 = isWed ? "#8A7560" : "#8585A8";

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 2200);
    return () => clearInterval(t);
  }, [list.length]);

  useEffect(() => {
    list.forEach((p) => {
      const im = new Image();
      im.src = p.img;
    });
  }, [list]);

  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen" style={{ background: screenBg, color: fg }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 28px 4px",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: fg,
          }}
        >
          <span>21:34</span>
          <span style={{ opacity: 0.8 }}>● ● ●</span>
        </div>

        <div style={{ padding: "44px 22px 18px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: fg2,
              marginBottom: 4,
            }}
          >
            {variant === "weddings"
              ? "Sofía & Mateo · Hacienda"
              : variant === "events"
              ? "Cemex · Annual Kickoff"
              : "Tu evento, ahora"}
          </div>
          <div
            style={{
              fontFamily: isWed ? "var(--font-editorial)" : "var(--font-display)",
              fontSize: 22,
              fontWeight: 600,
              fontStyle: isWed ? "italic" : "normal",
              letterSpacing: "-0.02em",
            }}
          >
            {variant === "weddings" ? "Conoce a tus invitados" : "Cerca de ti"}
          </div>
        </div>

        <div
          key={idx}
          style={{
            margin: "0 18px",
            aspectRatio: "3/4",
            borderRadius: 22,
            position: "relative",
            overflow: "hidden",
            animation: "phoneCardIn 0.55s cubic-bezier(.2,.7,.2,1)",
            backgroundColor: profile.color,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.img}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              animation: "phonePhotoZoom 2.2s ease-out",
            }}
            loading="eager"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(0deg, transparent 60%, ${profile.color}30 100%)`,
              mixBlendMode: "color",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              maxWidth: "70%",
            }}
          >
            {profile.interests.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 9px",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  borderRadius: 999,
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  backdropFilter: "blur(10px)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, color: "#fff" }}>
            <div
              style={{
                fontFamily: isWed ? "var(--font-editorial)" : "var(--font-display)",
                fontStyle: isWed ? "italic" : "normal",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {profile.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.85,
                marginTop: 2,
              }}
            >
              {profile.role}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", padding: "22px 0" }}>
          <button
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: isWed ? "#fff" : "var(--bg-3)",
              border: `1px solid ${isWed ? "#EAE2D2" : "rgba(255,255,255,0.1)"}`,
              color: fg2,
              fontSize: 20,
            }}
          >
            ✕
          </button>
          <button
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--gradient-hero)",
              color: "#fff",
              fontSize: 24,
              fontWeight: 600,
              boxShadow: "var(--glow-accent)",
            }}
          >
            ♥
          </button>
          <button
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: isWed ? "#fff" : "var(--bg-3)",
              border: `1px solid ${isWed ? "#EAE2D2" : "rgba(255,255,255,0.1)"}`,
              color: fg2,
              fontSize: 18,
            }}
          >
            💬
          </button>
        </div>

        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 6 }}>
          {list.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? 22 : 5,
                height: 5,
                borderRadius: 999,
                background: i === idx ? "var(--accent-lead)" : isWed ? "#EAE2D2" : "rgba(255,255,255,0.15)",
                transition: "width 0.4s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
