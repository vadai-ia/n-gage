"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
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
        <path d="M4 16h16" /><path d="M2 21h20" />
        <path d="M7 8v3" /><path d="M12 8v3" /><path d="M17 8v3" />
        <path d="M7 4v2" /><path d="M12 4v2" /><path d="M17 4v2" />
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
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    value: "cruise",
    label: "Crucero",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20l1.5-1.5C5 17 7 17 8.5 18.5 10 17 12 17 13.5 18.5 15 17 17 17 18.5 18.5 20 17 22 17 22 17l-1-1" />
        <path d="M4 18l-1-5h18l-1 5" /><path d="M12 13V4" />
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
  spark: 60, connect: 120, vibe: 180, luxe: 240, elite: 360, exclusive: 360,
};

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

// ── Date & Time Picker (compact with dropdown calendar) ──
function DateTimePicker({
  date, hour, minute,
  onDateChange, onHourChange, onMinuteChange,
}: {
  date: Date | null; hour: number; minute: number;
  onDateChange: (d: Date) => void; onHourChange: (h: number) => void; onMinuteChange: (m: number) => void;
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(date ? date.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(date ? date.getFullYear() : today.getFullYear());

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    let start = first.getDay() - 1; if (start < 0) start = 6;
    const count = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < start; i++) cells.push(null);
    for (let d = 1; d <= count; d++) cells.push(d);
    return cells;
  }, [viewMonth, viewYear]);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  const isSel = (day: number) => date && date.getDate() === day && date.getMonth() === viewMonth && date.getFullYear() === viewYear;
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const isPast = (day: number) => new Date(viewYear, viewMonth, day) < today;

  const dateLabel = date
    ? `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`
    : "Seleccionar fecha";

  return (
    <div className="flex flex-col gap-3">
      {/* Date + Time row */}
      <div className="flex gap-2">
        {/* Date button */}
        <button type="button" onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-left transition-all"
          style={{
            background: "rgba(255,255,255,0.04)", border: open ? "1px solid rgba(255,45,120,0.4)" : "1px solid rgba(255,255,255,0.04)",
            color: date ? "#F0F0FF" : "#44445A",
          }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={date ? "#FF2D78" : "#44445A"} strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="font-medium">{dateLabel}</span>
        </button>

        {/* Time selector */}
        <div className="flex items-center rounded-xl px-3 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          <select value={hour} onChange={(e) => onHourChange(Number(e.target.value))}
            className="bg-transparent text-sm font-bold outline-none appearance-none text-center w-8 cursor-pointer" style={{ color: "#F0F0FF" }}>
            {Array.from({ length: 24 }, (_, i) => <option key={i} value={i} style={{ background: "#0F0F1A" }}>{pad(i)}</option>)}
          </select>
          <span className="text-sm font-bold" style={{ color: "#44445A" }}>:</span>
          <select value={minute} onChange={(e) => onMinuteChange(Number(e.target.value))}
            className="bg-transparent text-sm font-bold outline-none appearance-none text-center w-8 cursor-pointer" style={{ color: "#F0F0FF" }}>
            {[0, 15, 30, 45].map((m) => <option key={m} value={m} style={{ background: "#0F0F1A" }}>{pad(m)}</option>)}
          </select>
        </div>
      </div>

      {/* Dropdown calendar */}
      {open && (
        <div className="rounded-xl p-3" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: "#8585A8" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-xs font-bold" style={{ color: "#F0F0FF" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: "#8585A8" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAY_NAMES.map((d) => <div key={d} className="text-center text-[9px] font-bold py-0.5" style={{ color: "#44445A" }}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const past = isPast(day); const sel = isSel(day); const tod = isToday(day);
              return (
                <button key={day} type="button" disabled={past}
                  onClick={() => { onDateChange(new Date(viewYear, viewMonth, day)); setOpen(false); }}
                  className="w-full aspect-square rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all"
                  style={{
                    background: sel ? "#FF2D78" : tod ? "rgba(255,45,120,0.08)" : "transparent",
                    color: sel ? "#fff" : past ? "#2a2a3a" : tod ? "#FF2D78" : "#F0F0FF",
                    boxShadow: sel ? "0 2px 8px rgba(255,45,120,0.3)" : "none",
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("wedding");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventHour, setEventHour] = useState(18);
  const [eventMinute, setEventMinute] = useState(0);
  const [venueName, setVenueName] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [plan, setPlan] = useState("vibe");
  const [timerMinutes, setTimerMinutes] = useState(180);
  const [expiryDays, setExpiryDays] = useState(3);
  const [accessCode, setAccessCode] = useState("");
  const [genderExtended, setGenderExtended] = useState(false);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState("");

  // Event photos — hasta 10 fotos que se muestran en el carrusel de bienvenida
  const [eventPhotos, setEventPhotos] = useState<string[]>([]); // URLs de Cloudinary (ya subidas)
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // Swipe window — solo hora de inicio, el fin se calcula
  const [showSearchWindow, setShowSearchWindow] = useState(false);
  const [swipeHour, setSwipeHour] = useState(21);
  const [swipeMinute, setSwipeMinute] = useState(0);

  // Computed: swipe end
  const swipeEndDisplay = useMemo(() => {
    const start = new Date(2020, 0, 1, swipeHour, swipeMinute);
    start.setMinutes(start.getMinutes() + timerMinutes);
    return `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  }, [swipeHour, swipeMinute, timerMinutes]);

  function handlePlanChange(p: string) {
    setPlan(p);
    setTimerMinutes(TIMER_DEFAULTS[p] ?? 60);
  }

  // Resize a File to max dimension and return as base64 data URL (JPEG 0.88)
  async function resizeImageFile(file: File, maxDim = 1600): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Canvas no disponible")); return; }
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.88));
        };
        img.onerror = () => reject(new Error("No se pudo leer la imagen"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setPhotoError("");
    setPhotoUploading(true);

    const remaining = 10 - eventPhotos.length;
    const toProcess = files.slice(0, remaining);

    for (const file of toProcess) {
      try {
        const dataUrl = await resizeImageFile(file, 1600);
        const res = await fetch("/api/v1/upload/selfie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, kind: "event_photo" }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setPhotoError(data.error || "No se pudo subir una de las fotos");
          continue;
        }
        setEventPhotos((prev) => [...prev, data.url]);
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : "Error al procesar la imagen");
      }
    }
    setPhotoUploading(false);
  }

  function removePhoto(i: number) {
    setEventPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function movePhoto(i: number, dir: -1 | 1) {
    setEventPhotos((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventDate) { setError("Selecciona la fecha del evento"); return; }
    setLoading(true);
    setError("");

    // eventDate is a Date built from year/month/day in local time by the calendar
    // widget, so cloning it and calling setHours() keeps the calendar day stable.
    const fullDate = new Date(eventDate);
    fullDate.setHours(eventHour, eventMinute, 0, 0);

    const payload: Record<string, unknown> = {
      name,
      type,
      event_date: fullDate.toISOString(),
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

    if (showSearchWindow) {
      // Build search_start_time using event date + swipe hour
      const startTime = new Date(fullDate);
      startTime.setHours(swipeHour, swipeMinute, 0, 0);
      payload.search_start_time = startTime.toISOString();

      // End = start + duration
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + timerMinutes);
      payload.search_end_time = endTime.toISOString();
    }

    if (whatsappGroupUrl.trim()) {
      payload.whatsapp_group_url = whatsappGroupUrl.trim();
    }

    if (eventPhotos.length > 0) {
      payload.event_photos = eventPhotos;
    }

    try {
      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { event?: { id?: string }; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(`Error del servidor (HTTP ${res.status}). Intenta de nuevo.`);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || `Error al crear el evento (HTTP ${res.status})`);
        setLoading(false);
        return;
      }

      if (!data.event?.id) {
        setError("Respuesta inválida del servidor: el evento no tiene ID");
        setLoading(false);
        return;
      }

      router.push(`/events/${data.event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red al crear el evento");
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.04)",
    color: "#F0F0FF",
  };

  // Date display
  const dateDisplay = eventDate
    ? `${eventDate.getDate()} de ${MONTH_NAMES[eventDate.getMonth()]} ${eventDate.getFullYear()} a las ${pad(eventHour)}:${pad(eventMinute)}`
    : null;

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
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>Nombre del evento *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Boda Maria & Carlos" required className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
        </div>

        {/* Type */}
        <div>
          <label className="text-sm mb-2 block font-semibold" style={{ color: "#8585A8" }}>Tipo de evento *</label>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: type === t.value ? "rgba(255,45,120,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${type === t.value ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.04)"}`,
                  color: type === t.value ? "#FF2D78" : "#8585A8",
                }}>
                <span className="flex items-center justify-center">{t.icon}</span>
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <label className="text-sm mb-2 block font-semibold" style={{ color: "#8585A8" }}>Fecha y hora del evento *</label>
          <DateTimePicker
            date={eventDate} hour={eventHour} minute={eventMinute}
            onDateChange={setEventDate} onHourChange={setEventHour} onMinuteChange={setEventMinute}
          />
          {dateDisplay && (
            <p className="text-xs mt-2 font-medium" style={{ color: "#FF2D78" }}>{dateDisplay}</p>
          )}
        </div>

        {/* Venue */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>Venue</label>
            <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Nombre del lugar" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>Ciudad</label>
            <input type="text" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} placeholder="Ciudad" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          </div>
        </div>

        {/* Event photos — carrusel de bienvenida */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold" style={{ color: "#8585A8" }}>
              Fotos del evento <span style={{ color: "#44445A" }}>(hasta 10)</span>
            </label>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md"
              style={{ background: eventPhotos.length > 0 ? "rgba(255,45,120,0.08)" : "rgba(255,255,255,0.03)", color: eventPhotos.length > 0 ? "#FF2D78" : "#44445A" }}>
              {eventPhotos.length}/10
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: "#44445A" }}>
            Se mostraran como carrusel de fondo en la portada de bienvenida. Sube fotos de los novios, del venue, del vibe del evento...
          </p>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {eventPhotos.map((url, i) => (
              <div key={url}
                className="relative aspect-square rounded-xl overflow-hidden group"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
                    PORTADA
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1 py-1"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
                  <div className="flex gap-0.5">
                    <button type="button" onClick={() => movePhoto(i, -1)} disabled={i === 0}
                      className="w-5 h-5 rounded-md flex items-center justify-center disabled:opacity-30"
                      style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                      aria-label="Mover izquierda">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <button type="button" onClick={() => movePhoto(i, 1)} disabled={i === eventPhotos.length - 1}
                      className="w-5 h-5 rounded-md flex items-center justify-center disabled:opacity-30"
                      style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                      aria-label="Mover derecha">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                  <button type="button" onClick={() => removePhoto(i)}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.9)", color: "#fff" }}
                    aria-label="Eliminar foto">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}

            {eventPhotos.length < 10 && (
              <label
                className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, rgba(255,45,120,0.08), rgba(123,47,190,0.08))",
                  border: "1px dashed rgba(255,45,120,0.35)",
                }}>
                {photoUploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
                    <span className="text-[10px] font-semibold" style={{ color: "#FF2D78" }}>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="text-[10px] font-bold tracking-wide text-center px-1" style={{ color: "#FF2D78" }}>
                      Subir fotos
                    </span>
                  </>
                )}
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={handlePhotosChange} disabled={photoUploading} />
              </label>
            )}
          </div>

          {photoError && (
            <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{photoError}</p>
          )}
        </div>

        {/* WhatsApp Group */}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8585A8" }}>
            URL del grupo de WhatsApp <span style={{ color: "#44445A" }}>(opcional)</span>
          </label>
          <input type="url" placeholder="https://chat.whatsapp.com/..." value={whatsappGroupUrl} onChange={(e) => setWhatsappGroupUrl(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          <p className="text-xs mt-1.5" style={{ color: "#44445A" }}>
            Si lo activas, los invitados veran un boton para unirse al grupo al escanear el QR.
          </p>
        </div>

        {/* Plan */}
        <div>
          <label className="text-sm mb-2 block font-semibold" style={{ color: "#8585A8" }}>Plan contratado *</label>
          <div className="flex flex-col gap-2">
            {PLANS.map((p) => {
              const selected = plan === p.value;
              const planColor = PLAN_COLORS[p.value] ?? "#FF2D78";
              return (
                <button key={p.value} type="button" onClick={() => handlePlanChange(p.value)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: selected ? `${planColor}12` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selected ? `${planColor}44` : "rgba(255,255,255,0.04)"}`,
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: selected ? planColor : "#44445A" }}>
                      {selected && <div className="w-2 h-2 rounded-full" style={{ background: planColor }} />}
                    </div>
                    <span className="font-semibold" style={{ color: selected ? planColor : "#F0F0FF" }}>{p.label}</span>
                    <span className="text-xs" style={{ color: "#44445A" }}>{p.guests}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm" style={{ color: selected ? planColor : "#8585A8" }}>{p.price}</div>
                    <div className="text-xs" style={{ color: "#44445A" }}>{p.timer}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timer / Search duration — 5min steps up to 1h, then 1h steps up to 6h */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>
            Duracion del swipe:{" "}
            <strong style={{ color: "#FF2D78" }}>{formatDuration(timerMinutes)}</strong>
          </label>
          <select
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-bold outline-none"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }}
          >
            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((m) => (
              <option key={m} value={m} style={{ background: "#0F0F1A" }}>{m} min</option>
            ))}
            {[120, 180, 240, 300, 360].map((m) => (
              <option key={m} value={m} style={{ background: "#0F0F1A" }}>{m / 60} hr{m === 60 ? "" : "s"}</option>
            ))}
          </select>
          <p className="text-xs mt-1" style={{ color: "#44445A" }}>
            De 5 en 5 min hasta 1 hora, despues de hora en hora hasta 6 horas.
          </p>
        </div>

        {/* Swipe Window — simplified */}
        <div className="rounded-xl p-4" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-sm" style={{ color: "#F0F0FF" }}>Horario del swipe</p>
              <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>
                Define a que hora inicia el swipe (opcional)
              </p>
            </div>
            <button type="button" onClick={() => setShowSearchWindow((v) => !v)}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: showSearchWindow ? "#FF2D78" : "rgba(255,255,255,0.08)" }}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: showSearchWindow ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>

          {showSearchWindow && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <label className="text-xs font-medium mb-2 block" style={{ color: "#8585A8" }}>Hora de inicio del swipe</label>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center rounded-xl px-3 py-2.5 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  <select value={swipeHour} onChange={(e) => setSwipeHour(Number(e.target.value))}
                    className="bg-transparent text-sm font-bold outline-none appearance-none text-center w-8 cursor-pointer" style={{ color: "#F0F0FF" }}>
                    {Array.from({ length: 24 }, (_, i) => <option key={i} value={i} style={{ background: "#0F0F1A" }}>{pad(i)}</option>)}
                  </select>
                  <span className="text-sm font-bold" style={{ color: "#44445A" }}>:</span>
                  <select value={swipeMinute} onChange={(e) => setSwipeMinute(Number(e.target.value))}
                    className="bg-transparent text-sm font-bold outline-none appearance-none text-center w-8 cursor-pointer" style={{ color: "#F0F0FF" }}>
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => <option key={m} value={m} style={{ background: "#0F0F1A" }}>{pad(m)}</option>)}
                  </select>
                </div>
                <span className="text-xs" style={{ color: "#44445A" }}>hasta</span>
                <span className="text-sm font-bold" style={{ color: "#F0F0FF" }}>{swipeEndDisplay}</span>
                <span className="text-xs" style={{ color: "#44445A" }}>({formatDuration(timerMinutes)})</span>
              </div>

              <p className="text-xs" style={{ color: "#44445A" }}>
                Si no lo activas, cada invitado inicia su timer al presionar &quot;Iniciar busqueda&quot;
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
          <input type="range" min={1} max={30} value={expiryDays} onChange={(e) => setExpiryDays(Number(e.target.value))} className="w-full" style={{ accentColor: "#FF2D78" }} />
          <p className="text-xs mt-1" style={{ color: "#44445A" }}>
            Las fotos y chats estaran disponibles {expiryDays} dias despues del evento
          </p>
        </div>

        {/* Access code */}
        <div>
          <label className="text-sm mb-1 block font-semibold" style={{ color: "#8585A8" }}>Codigo de acceso al evento *</label>
          <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())} placeholder="Ej. BODA2025" required maxLength={20}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none font-mono tracking-widest"
            style={{ ...inputStyle, color: "#FF2D78" }} />
          <p className="text-xs mt-1" style={{ color: "#44445A" }}>Se embebe en el QR. Los invitados no necesitan escribirlo.</p>
        </div>

        {/* Gender extended */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#F0F0FF" }}>Opciones de genero extendidas</p>
            <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>Incluir &quot;No binario&quot; y &quot;Prefiero no decir&quot;</p>
          </div>
          <button type="button" onClick={() => setGenderExtended((v) => !v)}
            className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
            style={{ background: genderExtended ? "#FF2D78" : "rgba(255,255,255,0.08)" }}>
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: genderExtended ? "calc(100% - 22px)" : "2px" }} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-center p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-lg disabled:opacity-60 transition-all"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff", boxShadow: "0 8px 30px rgba(255,45,120,0.25)" }}>
          {loading ? "Creando evento..." : "Crear evento y generar QR"}
        </button>
      </form>
    </div>
  );
}
