"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  { value: "wedding", label: "Boda", emoji: "💍" },
  { value: "birthday", label: "Cumpleanos", emoji: "🎂" },
  { value: "corporate", label: "Corporativo", emoji: "💼" },
  { value: "graduation", label: "Graduacion", emoji: "🎓" },
  { value: "concert", label: "Concierto", emoji: "🎵" },
  { value: "cruise", label: "Crucero", emoji: "🚢" },
  { value: "other", label: "Otro", emoji: "🎉" },
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
    border: "1px solid rgba(255,255,255,0.06)",
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
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#F0F0FF" }}>Crear evento</h1>

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
                  border: `1px solid ${type === t.value ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: type === t.value ? "#FF2D78" : "#8585A8",
                }}
              >
                <span className="text-xl">{t.emoji}</span>
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
                    border: `1px solid ${selected ? `${planColor}44` : "rgba(255,255,255,0.06)"}`,
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
          style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
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
            <div className="flex flex-col gap-3 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
          style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
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
