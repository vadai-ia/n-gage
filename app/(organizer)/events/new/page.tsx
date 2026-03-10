"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EVENT_TYPES: { value: string; label: string; icon: JSX.Element }[] = [
  {
    value: "wedding",
    label: "Boda",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    value: "birthday",
    label: "Cumpleanos",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
        <path d="M4 16h16" />
        <path d="M2 21h20" />
        <path d="M7 8v3" />
        <path d="M12 8v3" />
        <path d="M17 8v3" />
        <path d="M7 4v2" />
        <path d="M12 4v2" />
        <path d="M17 4v2" />
        <circle cx="7" cy="4" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
        <circle cx="17" cy="4" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    value: "corporate",
    label: "Corporativo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="12.01" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    value: "graduation",
    label: "Graduacion",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10l-10-5L2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
        <line x1="22" y1="10" x2="22" y2="16" />
      </svg>
    ),
  },
  {
    value: "concert",
    label: "Concierto",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    value: "cruise",
    label: "Crucero",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20l1.5-1.5C5 17 7 17 8.5 18.5 10 17 12 17 13.5 18.5 15 17 17 17 18.5 18.5 20 17 22 17 22 17l-1-1" />
        <path d="M4 18l-1-5h18l-1 5" />
        <path d="M12 13V4" />
        <path d="M8 8h8l-4-4-4 4z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    value: "other",
    label: "Otro",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const PLANS = [
  { value: "spark",     label: "Spark",     guests: "Hasta 50",   price: "$3,500",  timer: "1 hora" },
  { value: "connect",   label: "Connect",   guests: "51-100",     price: "$6,500",  timer: "2 horas" },
  { value: "vibe",      label: "Vibe",      guests: "101-200",    price: "$10,000", timer: "3 horas" },
  { value: "luxe",      label: "Luxe",      guests: "201-350",    price: "$15,000", timer: "Sin limite" },
  { value: "elite",     label: "Elite",     guests: "351-500",    price: "$22,000", timer: "Sin limite" },
  { value: "exclusive", label: "Exclusive", guests: "500+",       price: "Cotizar", timer: "Sin limite" },
];

const PLAN_COLORS: Record<string, string> = {
  spark: "#8585A8", connect: "#1A6EFF", vibe: "#FF2D78", luxe: "#FFB800", elite: "#7B2FBE", exclusive: "#FFB800",
};

const TIMER_DEFAULTS: Record<string, number> = {
  spark: 60, connect: 120, vibe: 180, luxe: 240, elite: 360, exclusive: 480,
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("wedding");
  const [dateTime, setDateTime] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [plan, setPlan] = useState("vibe");
  const [timerMinutes, setTimerMinutes] = useState(180);
  const [expiryDays, setExpiryDays] = useState(3);
  const [accessCode, setAccessCode] = useState("");
  const [genderExtended, setGenderExtended] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState("");
  const [searchEndTime, setSearchEndTime] = useState("");
  const [showSearchWindow, setShowSearchWindow] = useState(false);

  function handlePlanChange(p: string) {
    setPlan(p);
    setTimerMinutes(TIMER_DEFAULTS[p] ?? 60);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: Record<string, unknown> = {
      name,
      type,
      event_date: dateTime,
      venue_name: venueName || undefined,
      venue_city: venueCity || undefined,
      plan,
      search_duration_minutes: timerMinutes,
      expiry_type: "custom_days",
      expiry_days: expiryDays,
      access_code: accessCode,
      gender_extended_mode: genderExtended,
      language: "es-MX",
    };

    if (showSearchWindow && searchStartTime) {
      payload.search_start_time = searchStartTime;
    }
    if (showSearchWindow && searchEndTime) {
      payload.search_end_time = searchEndTime;
    }

    const res = await fetch("/api/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al crear el evento");
      setLoading(false);
      return;
    }
    router.push(`/events/${data.event.id}`);
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.04)",
    color: "#F0F0FF",
    colorScheme: "dark" as const,
  };

  return (
    <div className="p-4 pb-8">
      <button
        onClick={() => router.back()}
        className="text-sm mb-4 flex items-center gap-1 transition-colors"
        style={{ color: "#8585A8" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>
      <h1 className="text-2xl font-black tracking-tight mb-6" style={{ color: "#F0F0FF" }}>Crear evento</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Name */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>
            Nombre del evento *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Boda Maria & Carlos"
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-sm mb-2 block font-semibold" style={{ color: "#8585A8" }}>
            Tipo de evento *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: type === t.value ? "rgba(255,45,120,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${type === t.value ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.04)"}`,
                  color: type === t.value ? "#FF2D78" : "#8585A8",
                }}
              >
                <span className="flex items-center justify-center">{t.icon}</span>
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>
            Fecha y hora del evento *
          </label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
          <p className="text-xs mt-1" style={{ color: "#44445A" }}>
            Fecha y hora de inicio del evento
          </p>
        </div>

        {/* Venue */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>Venue</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Nombre del lugar"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>Ciudad</label>
            <input
              type="text"
              value={venueCity}
              onChange={(e) => setVenueCity(e.target.value)}
              placeholder="Ciudad"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Plan */}
        <div>
          <label className="text-sm mb-2 block font-semibold" style={{ color: "#8585A8" }}>
            Plan contratado *
          </label>
          <div className="flex flex-col gap-2">
            {PLANS.map((p) => {
              const selected = plan === p.value;
              const planColor = PLAN_COLORS[p.value] ?? "#FF2D78";
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePlanChange(p.value)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: selected ? `${planColor}12` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selected ? `${planColor}44` : "rgba(255,255,255,0.04)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: selected ? planColor : "#44445A" }}
                    >
                      {selected && <div className="w-2 h-2 rounded-full" style={{ background: planColor }} />}
                    </div>
                    <span className="font-semibold" style={{ color: selected ? planColor : "#F0F0FF" }}>
                      {p.label}
                    </span>
                    <span className="text-xs" style={{ color: "#44445A" }}>{p.guests}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm" style={{ color: selected ? planColor : "#8585A8" }}>
                      {p.price}
                    </div>
                    <div className="text-xs" style={{ color: "#44445A" }}>{p.timer}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer / Search duration */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>
            Duracion de busqueda:{" "}
            <strong style={{ color: "#FF2D78" }}>{formatDuration(timerMinutes)}</strong>
          </label>
          <input
            type="range"
            min={15}
            max={480}
            step={15}
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: "#FF2D78" }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: "#44445A" }}>
            <span>15 min</span>
            <span>8 hrs</span>
          </div>
        </div>

        {/* Search Window (optional) */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-sm" style={{ color: "#F0F0FF" }}>
                Ventana de busqueda
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>
                Define cuando pueden los invitados hacer swipe (opcional)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSearchWindow((v) => !v)}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: showSearchWindow ? "#FF2D78" : "rgba(255,255,255,0.08)" }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
                style={{ left: showSearchWindow ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
          </div>

          {showSearchWindow && (
            <div className="flex flex-col gap-3 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#8585A8" }}>
                  Inicio de swipe
                </label>
                <input
                  type="datetime-local"
                  value={searchStartTime}
                  onChange={(e) => setSearchStartTime(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#8585A8" }}>
                  Fin de swipe
                </label>
                <input
                  type="datetime-local"
                  value={searchEndTime}
                  onChange={(e) => setSearchEndTime(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <p className="text-xs" style={{ color: "#44445A" }}>
                Si no se configuran, se usa el timer individual por invitado
              </p>
            </div>
          )}
        </div>

        {/* Content expiry */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>
            Caducidad del contenido:{" "}
            <strong style={{ color: "#FF2D78" }}>{expiryDays} dias</strong>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: "#FF2D78" }}
          />
          <p className="text-xs mt-1" style={{ color: "#44445A" }}>
            Las fotos y chats estaran disponibles {expiryDays} dias despues del evento
          </p>
        </div>

        {/* Access code */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>
            Codigo de acceso al evento *
          </label>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            placeholder="Ej. BODA2025"
            required
            maxLength={20}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none font-mono tracking-widest"
            style={{ ...inputStyle, color: "#FF2D78" }}
          />
          <p className="text-xs mt-1" style={{ color: "#44445A" }}>
            Se embebe en el QR. Los invitados no necesitan escribirlo.
          </p>
        </div>

        {/* Gender extended */}
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div>
            <p className="font-semibold text-sm" style={{ color: "#F0F0FF" }}>Opciones de genero extendidas</p>
            <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>
              Incluir &quot;No binario&quot; y &quot;Prefiero no decir&quot; en el registro
            </p>
          </div>
          <button
            type="button"
            onClick={() => setGenderExtended((v) => !v)}
            className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
            style={{ background: genderExtended ? "#FF2D78" : "rgba(255,255,255,0.08)" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
              style={{ left: genderExtended ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-sm text-center p-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-lg disabled:opacity-60 transition-all"
          style={{
            background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            color: "#fff",
            boxShadow: "0 8px 30px rgba(255,45,120,0.25)",
          }}
        >
          {loading ? "Creando evento..." : "Crear evento y generar QR"}
        </button>
      </form>
    </div>
  );
}
