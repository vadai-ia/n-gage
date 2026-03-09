"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  { value: "wedding", label: "Boda", emoji: "💍" },
  { value: "birthday", label: "Cumpleaños", emoji: "🎂" },
  { value: "corporate", label: "Corporativo", emoji: "💼" },
  { value: "graduation", label: "Graduación", emoji: "🎓" },
  { value: "concert", label: "Concierto", emoji: "🎵" },
  { value: "cruise", label: "Crucero", emoji: "🚢" },
  { value: "other", label: "Otro", emoji: "🎉" },
];

const PLANS = [
  { value: "spark",     label: "Spark ✨",     guests: "Hasta 50",   price: "$3,500",  timer: "1 hora" },
  { value: "connect",   label: "Connect 💫",   guests: "51–100",     price: "$6,500",  timer: "2 horas" },
  { value: "vibe",      label: "Vibe 🔥",      guests: "101–200",    price: "$10,000", timer: "3 horas" },
  { value: "luxe",      label: "Luxe 💎",      guests: "201–350",    price: "$15,000", timer: "Sin límite" },
  { value: "elite",     label: "Elite 👑",     guests: "351–500",    price: "$22,000", timer: "Sin límite" },
  { value: "exclusive", label: "Exclusive 🌟", guests: "500+",       price: "Cotizar", timer: "Sin límite" },
];

const TIMER_DEFAULTS: Record<string, number> = {
  spark: 60, connect: 120, vibe: 180, luxe: 240, elite: 360, exclusive: 480,
};

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("wedding");
  const [date, setDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [plan, setPlan] = useState("vibe");
  const [timerMinutes, setTimerMinutes] = useState(180);
  const [expiryDays, setExpiryDays] = useState(3);
  const [accessCode, setAccessCode] = useState("");
  const [genderExtended, setGenderExtended] = useState(false);

  function handlePlanChange(p: string) {
    setPlan(p);
    setTimerMinutes(TIMER_DEFAULTS[p] ?? 60);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, type, event_date: date,
        venue_name: venueName, venue_city: venueCity,
        plan, search_duration_minutes: timerMinutes,
        expiry_type: "custom_days", expiry_days: expiryDays,
        access_code: accessCode,
        gender_extended_mode: genderExtended,
        language: "es-MX",
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Error al crear el evento"); setLoading(false); return; }
    router.push(`/events/${data.event.id}`);
  }

  return (
    <div className="p-4 pb-8">
      <button onClick={() => router.back()} className="text-sm mb-4 flex items-center gap-1" style={{ color: "#A0A0B0" }}>
        ← Volver
      </button>
      <h1 className="text-2xl font-bold mb-6">Crear evento</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Nombre */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#A0A0B0" }}>Nombre del evento *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Boda María & Carlos" required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
        </div>

        {/* Tipo */}
        <div>
          <label className="text-sm mb-2 block font-semibold" style={{ color: "#A0A0B0" }}>Tipo de evento *</label>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: type === t.value ? "rgba(255,60,172,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${type === t.value ? "#FF3CAC" : "rgba(255,255,255,0.08)"}`,
                  color: type === t.value ? "#FF3CAC" : "#ccc",
                }}>
                <span className="text-xl">{t.emoji}</span>
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#A0A0B0" }}>Fecha del evento *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
              colorScheme: "dark" }} />
        </div>

        {/* Lugar */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm mb-1 block font-semibold" style={{ color: "#A0A0B0" }}>Venue</label>
            <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)}
              placeholder="Nombre del lugar"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
          </div>
          <div>
            <label className="text-sm mb-1 block font-semibold" style={{ color: "#A0A0B0" }}>Ciudad</label>
            <input type="text" value={venueCity} onChange={(e) => setVenueCity(e.target.value)}
              placeholder="Ciudad"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
          </div>
        </div>

        {/* Plan */}
        <div>
          <label className="text-sm mb-2 block font-semibold" style={{ color: "#A0A0B0" }}>Plan contratado *</label>
          <div className="flex flex-col gap-2">
            {PLANS.map((p) => (
              <button key={p.value} type="button" onClick={() => handlePlanChange(p.value)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: plan === p.value ? "rgba(255,60,172,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${plan === p.value ? "#FF3CAC" : "rgba(255,255,255,0.07)"}`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: plan === p.value ? "#FF3CAC" : "#555" }}>
                    {plan === p.value && <div className="w-2 h-2 rounded-full" style={{ background: "#FF3CAC" }} />}
                  </div>
                  <span className="font-semibold" style={{ color: plan === p.value ? "#FF3CAC" : "#fff" }}>
                    {p.label}
                  </span>
                  <span className="text-xs" style={{ color: "#666" }}>{p.guests}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm" style={{ color: plan === p.value ? "#FF3CAC" : "#ccc" }}>
                    {p.price}
                  </div>
                  <div className="text-xs" style={{ color: "#555" }}>{p.timer}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#A0A0B0" }}>
            Duración de búsqueda: <strong style={{ color: "#FF3CAC" }}>{timerMinutes} min</strong>
          </label>
          <input type="range" min={15} max={480} step={15} value={timerMinutes}
            onChange={(e) => setTimerMinutes(Number(e.target.value))}
            className="w-full accent-pink-500" style={{ accentColor: "#FF3CAC" }} />
          <div className="flex justify-between text-xs mt-1" style={{ color: "#555" }}>
            <span>15 min</span><span>8 hrs</span>
          </div>
        </div>

        {/* Caducidad */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#A0A0B0" }}>
            Caducidad del contenido: <strong style={{ color: "#FF3CAC" }}>{expiryDays} días</strong>
          </label>
          <input type="range" min={1} max={30} value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="w-full" style={{ accentColor: "#FF3CAC" }} />
          <p className="text-xs mt-1" style={{ color: "#555" }}>
            Las fotos y chats estarán disponibles {expiryDays} días después del evento
          </p>
        </div>

        {/* Código de acceso */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#A0A0B0" }}>
            Código de acceso al evento *
          </label>
          <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            placeholder="Ej. BODA2025" required maxLength={20}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none font-mono tracking-widest"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#FF3CAC" }} />
          <p className="text-xs mt-1" style={{ color: "#555" }}>
            Se embebe en el QR. Los invitados no necesitan escribirlo.
          </p>
        </div>

        {/* Género extendido */}
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p className="font-semibold text-sm">Opciones de género extendidas</p>
            <p className="text-xs mt-0.5" style={{ color: "#A0A0B0" }}>
              Incluir &quot;No binario&quot; y &quot;Prefiero no decir&quot; en el registro
            </p>
          </div>
          <button type="button" onClick={() => setGenderExtended((v) => !v)}
            className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
            style={{ background: genderExtended ? "#FF3CAC" : "rgba(255,255,255,0.1)" }}>
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
              style={{ left: genderExtended ? "calc(100% - 22px)" : "2px" }} />
          </button>
        </div>

        {error && (
          <p className="text-sm text-center p-3 rounded-xl"
            style={{ background: "rgba(255,60,172,0.1)", color: "#FF3CAC" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-lg disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff",
            boxShadow: "0 8px 30px rgba(255,60,172,0.3)" }}>
          {loading ? "Creando evento..." : "Crear evento y generar QR 🚀"}
        </button>
      </form>
    </div>
  );
}
