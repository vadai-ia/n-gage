"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import { getRelationLabel } from "@/lib/utils/relationLabels";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────

type Registration = {
  id: string;
  selfie_url: string;
  table_number: string | null;
  relation_type: string | null;
  gender: string;
  looking_for: string;
  interests: string[];
  search_started_at: string | null;
  created_at: string;
  user: { full_name: string; email: string; avatar_url: string | null };
};

type Host = {
  id: string;
  label: string | null;
  user: { full_name: string; email: string; avatar_url: string | null };
};

type EventDetail = {
  id: string;
  name: string;
  type: string;
  event_date: string;
  venue_name: string | null;
  venue_city: string | null;
  status: string;
  unique_slug: string;
  qr_code_url: string | null;
  search_duration_minutes: number;
  search_start_time: string | null;
  search_end_time: string | null;
  expiry_type: string;
  expiry_days: number;
  plan: string;
  plan_guest_limit: number | null;
  max_guests: number | null;
  gender_extended_mode: boolean;
  language: string;
  access_codes: { code: string }[];
  hosts: Host[];
  registrations: Registration[];
  _count: { registrations: number; matches: number; photos: number };
};

type Stats = {
  registrations: number;
  searchesStarted: number;
  totalLikes: number;
  matches: number;
  photos: { total: number; visible: number; pending: number };
  capacity: number | null;
};

type MatchEntry = {
  id: string;
  matched_at: string;
  user_a: { full_name: string; avatar_url: string | null };
  user_b: { full_name: string; avatar_url: string | null };
};

// ─── Constants ───────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft:   { label: "Borrador", color: "#8585A8" },
  active:  { label: "Activo",   color: "#10B981" },
  closed:  { label: "Cerrado",  color: "#EF4444" },
  expired: { label: "Expirado", color: "#F59E0B" },
};

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  spark:     { label: "Spark",     color: "#8585A8" },
  connect:   { label: "Connect",   color: "#1A6EFF" },
  vibe:      { label: "Vibe",      color: "#FF2D78" },
  luxe:      { label: "Luxe",      color: "#FFB800" },
  elite:     { label: "Elite",     color: "#7B2FBE" },
  exclusive: { label: "Exclusive", color: "#FFB800" },
};

const EVENT_TYPES = [
  { value: "wedding", label: "Boda" },
  { value: "birthday", label: "Cumpleanos" },
  { value: "corporate", label: "Corporativo" },
  { value: "graduation", label: "Graduacion" },
  { value: "concert", label: "Concierto" },
  { value: "cruise", label: "Crucero" },
  { value: "other", label: "Otro" },
];

const PLANS = ["spark", "connect", "vibe", "luxe", "elite", "exclusive"];

const GENDER_LABELS: Record<string, string> = {
  male: "Hombre", female: "Mujer", non_binary: "No binario", prefer_not_say: "No dice",
};

const LOOKING_LABELS: Record<string, string> = {
  men: "Hombres", women: "Mujeres", everyone: "Todos", non_binary: "No binario",
};

// Labels imported from @/lib/utils/relationLabels

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function toLocalDatetimeStr(isoStr: string | null): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

// ─── Styles ──────────────────────────────────────────────

const cardStyle = {
  background: "#0F0F1A",
  border: "1px solid rgba(255,255,255,0.04)",
};

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.04)",
  color: "#F0F0FF",
  colorScheme: "dark" as const,
};

// ─── Component ───────────────────────────────────────────

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string | null>(null);

  // Host management
  const [newHostEmail, setNewHostEmail] = useState("");
  const [newHostLabel, setNewHostLabel] = useState("");
  const [addingHost, setAddingHost] = useState(false);
  const [hostError, setHostError] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"config" | "registrations" | "matches" | "reviews">("config");

  // Reviews
  const [reviews, setReviews] = useState<{ user: { full_name: string; email: string }; rating: number; comment: string | null; would_use_again: boolean; created_at: string }[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; average: number; wouldUseAgain: number; distribution: number[] } | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editDateTime, setEditDateTime] = useState("");
  const [editVenueName, setEditVenueName] = useState("");
  const [editVenueCity, setEditVenueCity] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editDuration, setEditDuration] = useState(60);
  const [editSearchStart, setEditSearchStart] = useState("");
  const [editSearchEnd, setEditSearchEnd] = useState("");
  const [editExpiryDays, setEditExpiryDays] = useState(3);
  const [editMaxGuests, setEditMaxGuests] = useState("");
  const [editGenderExtended, setEditGenderExtended] = useState(false);
  const [editAccessCode, setEditAccessCode] = useState("");
  const [editWhatsappGroupUrl, setEditWhatsappGroupUrl] = useState("");

  // Check admin role once on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.role === "SUPER_ADMIN") setIsAdmin(true);
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [evRes, statsRes] = await Promise.all([
        fetch(`/api/v1/events/${id}`).then((r) => r.json()),
        fetch(`/api/v1/events/${id}/stats`).then((r) => r.json()),
      ]);
      const ev = evRes.event;
      if (ev) {
        setEvent(ev);
        // Populate edit state
        setEditName(ev.name);
        setEditType(ev.type);
        setEditDateTime(toLocalDatetimeStr(ev.event_date));
        setEditVenueName(ev.venue_name ?? "");
        setEditVenueCity(ev.venue_city ?? "");
        setEditPlan(ev.plan);
        setEditDuration(ev.search_duration_minutes);
        setEditSearchStart(toLocalDatetimeStr(ev.search_start_time));
        setEditSearchEnd(toLocalDatetimeStr(ev.search_end_time));
        setEditExpiryDays(ev.expiry_days);
        setEditMaxGuests(ev.max_guests?.toString() ?? "");
        setEditGenderExtended(ev.gender_extended_mode);
        setEditAccessCode(ev.access_codes?.[0]?.code ?? "");
        setEditWhatsappGroupUrl(ev.whatsapp_group_url ?? "");
      }
      setStats(statsRes);

      // Load reviews
      try {
        const revRes = await fetch(`/api/v1/events/${id}/reviews?mode=all`).then((r) => r.json());
        setReviews(revRes.reviews ?? []);
        setReviewStats(revRes.stats ?? null);
      } catch { /* non-blocking */ }
    } catch {
      // handle silently
    }
    setLoading(false);
  }, [id]);

  const loadMatches = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/events/${id}/matches/all`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches ?? []);
      }
    } catch {
      // no endpoint yet, silently fail
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!event) return;
    const code = event.access_codes?.[0]?.code ?? "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/e/${event.unique_slug}${code ? `?code=${encodeURIComponent(code)}` : ""}`;
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: "#FF2D78", light: "#0A0A0F" },
    })
      .then(setGeneratedQrUrl)
      .catch(() => setGeneratedQrUrl(event.qr_code_url));
  }, [event]);

  useEffect(() => {
    if (activeTab === "matches") loadMatches();
  }, [activeTab, loadMatches]);

  // Load registrations when tab opens
  const loadRegistrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/events/${id}/registrations`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations ?? []);
      }
    } catch {
      // silently fail
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "registrations") loadRegistrations();
  }, [activeTab, loadRegistrations]);

  // Real-time polling for registrations tab
  useEffect(() => {
    if (activeTab !== "registrations") return;
    const interval = setInterval(loadRegistrations, 10000);
    return () => clearInterval(interval);
  }, [activeTab, loadRegistrations]);

  // ─── Actions ─────────────────────────────────────────

  async function toggleStatus() {
    if (!event) return;
    setActivating(true);
    const newStatus = event.status === "active" ? "closed" : "active";
    await fetch(`/api/v1/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setEvent((e) => (e ? { ...e, status: newStatus } : e));
    setActivating(false);
  }

  async function addHost() {
    setAddingHost(true);
    setHostError("");
    const res = await fetch(`/api/v1/events/${id}/hosts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newHostEmail.trim(), label: newHostLabel.trim() || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setHostError(data.error || "Error al agregar host");
    } else {
      setNewHostEmail("");
      setNewHostLabel("");
      loadData();
    }
    setAddingHost(false);
  }

  async function removeHost(hostId: string) {
    if (!confirm("Eliminar este host?")) return;
    await fetch(`/api/v1/events/${id}/hosts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostId }),
    });
    loadData();
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    const payload: Record<string, unknown> = {
      name: editName,
      type: editType,
      event_date: editDateTime,
      venue_name: editVenueName || null,
      venue_city: editVenueCity || null,
      plan: editPlan,
      search_duration_minutes: editDuration,
      search_start_time: editSearchStart || null,
      search_end_time: editSearchEnd || null,
      expiry_days: editExpiryDays,
      expiry_type: "custom_days",
      max_guests: editMaxGuests ? parseInt(editMaxGuests) : null,
      gender_extended_mode: editGenderExtended,
      whatsapp_group_url: editWhatsappGroupUrl.trim() || null,
    };

    const res = await fetch(`/api/v1/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.event) {
        setEvent((prev) => prev ? { ...prev, ...data.event } : prev);
      }
      setSaveMessage("Guardado correctamente");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("Error al guardar");
    }
    setSaving(false);
  }

  function downloadQR() {
    const dataUrl = generatedQrUrl ?? event?.qr_code_url;
    if (!dataUrl || !event) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${event.unique_slug}.png`;
    a.click();
  }

  function copyLink() {
    const code = event?.access_codes?.[0]?.code ?? "";
    const url = `${window.location.origin}/e/${event?.unique_slug}${code ? `?code=${code}` : ""}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Loading skeleton ────────────────────────────────

  if (loading || !event) {
    return (
      <div className="p-4">
        <div className="skeleton h-6 w-24 rounded-lg mb-4" />
        <div className="skeleton h-10 w-64 rounded-xl mb-2" />
        <div className="skeleton h-5 w-48 rounded-lg mb-6" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const code = event.access_codes?.[0]?.code ?? "";
  const eventUrl = `${appUrl}/e/${event.unique_slug}${code ? `?code=${code}` : ""}`;
  const statusInfo = STATUS_MAP[event.status] ?? STATUS_MAP.draft;
  const planInfo = PLAN_LABELS[event.plan] ?? PLAN_LABELS.vibe;
  const capacity = event.max_guests ?? event.plan_guest_limit ?? null;
  const regCount = stats?.registrations ?? event._count.registrations;

  return (
    <div className="p-4 pb-8">
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-sm mb-4 flex items-center gap-1 transition-colors"
        style={{ color: "#8585A8" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Mis eventos
      </button>

      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight leading-tight" style={{ color: "#F0F0FF" }}>
            {event.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8585A8" }}>
            {new Date(event.event_date).toLocaleDateString("es-MX", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
            {event.venue_city ? ` · ${event.venue_city}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: `${statusInfo.color}18`,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.color}33`,
            }}
          >
            {statusInfo.label}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: `${planInfo.color}12`,
              color: planInfo.color,
              border: `1px solid ${planInfo.color}33`,
            }}
          >
            {planInfo.label}
          </span>
        </div>
      </div>

      {/* Toggle status — admin only */}
      {isAdmin ? (
        <button
          onClick={toggleStatus}
          disabled={activating}
          className="w-full py-3 rounded-xl font-bold text-sm mb-6 disabled:opacity-60 transition-all"
          style={{
            background: event.status === "active"
              ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            border: event.status === "active" ? "1px solid rgba(239,68,68,0.3)" : "none",
            color: event.status === "active" ? "#EF4444" : "#fff",
          }}
        >
          {activating ? "Actualizando..." : event.status === "active" ? "Cerrar evento" : "Activar evento"}
        </button>
      ) : (
        <div className="w-full py-3 rounded-xl text-center text-xs mb-6"
          style={{ background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.15)", color: "#FFB800" }}>
          Tu evento sera activado por el admin de N&apos;GAGE
        </div>
      )}

      {/* ─── Stats Cards ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Registros", value: regCount, sub: capacity ? `de ${capacity}` : null, color: "#1A6EFF" },
          { label: "Matches", value: stats?.matches ?? event._count.matches, sub: null, color: "#FF2D78" },
          { label: "Fotos", value: stats?.photos?.total ?? event._count.photos, sub: null, color: "#7B2FBE" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={cardStyle}>
            <div className="text-2xl font-bold" style={{ color: "#F0F0FF" }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#8585A8" }}>{s.label}</div>
            {s.sub && <div className="text-xs" style={{ color: "#44445A" }}>{s.sub}</div>}
            {/* Capacity bar for registrations */}
            {s.label === "Registros" && capacity && (
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (regCount / capacity) * 100)}%`,
                    background: regCount >= capacity ? "#EF4444" : `linear-gradient(90deg, ${s.color}, #7B2FBE)`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          { label: "Busquedas", value: stats?.searchesStarted ?? 0, color: "#FFB800" },
          { label: "Likes", value: stats?.totalLikes ?? 0, color: "#FF2D78" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 flex items-center gap-3" style={cardStyle}>
            <div>
              <div className="text-lg font-bold" style={{ color: "#F0F0FF" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "#8585A8" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── QR Code Section ────────────────────────────── */}
      <div className="rounded-2xl p-4 mb-4 text-center" style={cardStyle}>
        <p className="text-sm font-black tracking-tight mb-3" style={{ color: "#F0F0FF" }}>Codigo QR del evento</p>
        {generatedQrUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedQrUrl}
              alt="QR del evento"
              className="w-40 h-40 mx-auto rounded-xl mb-3"
              style={{ imageRendering: "pixelated" }}
            />
            <p className="text-xs mb-3 break-all font-mono" style={{ color: "#8585A8" }}>{eventUrl}</p>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: copied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.04)"}`,
                  color: copied ? "#10B981" : "#8585A8",
                }}
              >
                {copied ? "Copiado!" : "Copiar link"}
              </button>
              <button
                onClick={downloadQR}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "rgba(255,45,120,0.08)",
                  border: "1px solid rgba(255,45,120,0.25)",
                  color: "#FF2D78",
                }}
              >
                Descargar QR
              </button>
            </div>
          </>
        ) : (
          <div className="w-40 h-40 mx-auto rounded-xl mb-3 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        )}
      </div>

      {/* Access code */}
      {code && (
        <div
          className="rounded-xl p-3 mb-6 flex items-center justify-between"
          style={{ background: "rgba(255,45,120,0.05)", border: "1px solid rgba(255,45,120,0.15)" }}
        >
          <div>
            <p className="text-xs" style={{ color: "#8585A8" }}>Codigo de acceso</p>
            <p className="font-mono font-bold text-lg tracking-widest" style={{ color: "#FF2D78" }}>{code}</p>
          </div>
          <span className="text-xs" style={{ color: "#44445A" }}>Embebido en el QR</span>
        </div>
      )}

      {/* ─── Hosts Section ──────────────────────────────── */}
      <div className="rounded-2xl p-4 mb-6" style={cardStyle}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black tracking-tight" style={{ color: "#F0F0FF" }}>
            Hosts del evento ({event.hosts.length}/3)
          </h3>
        </div>

        {event.hosts.length === 0 ? (
          <p className="text-xs mb-3" style={{ color: "#44445A" }}>
            Sin hosts asignados. Los hosts (anfitriones) ven todas las fotos y matches.
          </p>
        ) : (
          <div className="flex flex-col gap-2 mb-3">
            {event.hosts.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(123,47,190,0.15)", color: "#7B2FBE" }}>
                  {h.user.full_name?.charAt(0) ?? "H"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "#F0F0FF" }}>{h.user.full_name}</p>
                  <p className="text-xs" style={{ color: "#44445A" }}>{h.label ?? h.user.email}</p>
                </div>
                <button onClick={() => removeHost(h.id)}
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}

        {event.hosts.length < 3 && (
          <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-bold" style={{ color: "#FFB800" }}>Agregar host</p>
            <input
              type="email"
              placeholder="email del host (debe estar registrado en N'GAGE)"
              value={newHostEmail}
              onChange={(e) => setNewHostEmail(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Etiqueta (Novia, Novio, etc.) - opcional"
              value={newHostLabel}
              onChange={(e) => setNewHostLabel(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
            {hostError && <p className="text-xs" style={{ color: "#EF4444" }}>{hostError}</p>}
            <button
              onClick={addHost}
              disabled={addingHost || !newHostEmail.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
            >
              {addingHost ? "Agregando..." : "Agregar host"}
            </button>
          </div>
        )}
      </div>

      {/* ─── Tabs ───────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
        {([
          { key: "config", label: "Configuracion" },
          { key: "registrations", label: `Registros (${registrations.length || event._count.registrations})` },
          { key: "matches", label: `Matches (${event._count.matches})` },
          { key: "reviews", label: `Resenas (${reviewStats?.total ?? 0})` },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeTab === tab.key ? "rgba(255,45,120,0.1)" : "transparent",
              color: activeTab === tab.key ? "#FF2D78" : "#8585A8",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Config Tab ─────────────────────────────────── */}
      {activeTab === "config" && (
        <div className="rounded-2xl p-4" style={cardStyle}>
          <h3 className="text-sm font-black tracking-tight mb-4" style={{ color: "#F0F0FF" }}>Configuracion del evento</h3>

          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>Nombre</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>Tipo</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                style={inputStyle}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>Fecha y hora</label>
              <input
                type="datetime-local"
                value={editDateTime}
                onChange={(e) => setEditDateTime(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* Venue */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>Venue</label>
                <input
                  type="text"
                  value={editVenueName}
                  onChange={(e) => setEditVenueName(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>Ciudad</label>
                <input
                  type="text"
                  value={editVenueCity}
                  onChange={(e) => setEditVenueCity(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Plan */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>Plan</label>
              <select
                value={editPlan}
                onChange={(e) => setEditPlan(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                style={inputStyle}
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>{PLAN_LABELS[p]?.label ?? p}</option>
                ))}
              </select>
            </div>

            {/* Search duration */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>
                Duracion de busqueda:{" "}
                <span style={{ color: "#FF2D78" }}>{formatDuration(editDuration)}</span>
              </label>
              <input
                type="range"
                min={15}
                max={480}
                step={15}
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#FF2D78" }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "#44445A" }}>
                <span>15 min</span><span>8 hrs</span>
              </div>
            </div>

            {/* Search window */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <label className="text-xs mb-2 block font-medium" style={{ color: "#8585A8" }}>
                Ventana de busqueda (opcional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#44445A" }}>Inicio swipe</label>
                  <input
                    type="datetime-local"
                    value={editSearchStart}
                    onChange={(e) => setEditSearchStart(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "#44445A" }}>Fin swipe</label>
                  <input
                    type="datetime-local"
                    value={editSearchEnd}
                    onChange={(e) => setEditSearchEnd(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: "#44445A" }}>
                Si se dejan vacios, se usa el timer individual por invitado
              </p>
            </div>

            {/* Expiry */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>
                Caducidad del contenido:{" "}
                <span style={{ color: "#FF2D78" }}>{editExpiryDays} dias</span>
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={editExpiryDays}
                onChange={(e) => setEditExpiryDays(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "#FF2D78" }}
              />
            </div>

            {/* Max guests */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>
                Max invitados (override)
              </label>
              <input
                type="number"
                value={editMaxGuests}
                onChange={(e) => setEditMaxGuests(e.target.value)}
                placeholder="Sin limite manual"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: "#44445A" }}>
                Deja vacio para usar el limite del plan
              </p>
            </div>

            {/* Gender extended */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "#F0F0FF" }}>Genero extendido</p>
                <p className="text-xs" style={{ color: "#44445A" }}>No binario y prefiero no decir</p>
              </div>
              <button
                type="button"
                onClick={() => setEditGenderExtended((v) => !v)}
                className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                style={{ background: editGenderExtended ? "#FF2D78" : "rgba(255,255,255,0.08)" }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all"
                  style={{ left: editGenderExtended ? "calc(100% - 22px)" : "2px" }}
                />
              </button>
            </div>

            {/* Access code (read-only display) */}
            <div>
              <label className="text-xs mb-1 block font-medium" style={{ color: "#8585A8" }}>Codigo de acceso</label>
              <input
                type="text"
                value={editAccessCode}
                readOnly
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-mono tracking-widest"
                style={{ ...inputStyle, color: "#FF2D78", opacity: 0.7 }}
              />
              <p className="text-xs mt-1" style={{ color: "#44445A" }}>
                El codigo de acceso no se puede cambiar despues de crearlo
              </p>
            </div>

            {/* WhatsApp Group URL */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8585A8" }}>
                URL del grupo de WhatsApp
              </label>
              <input
                type="url"
                placeholder="https://chat.whatsapp.com/..."
                value={editWhatsappGroupUrl}
                onChange={(e) => setEditWhatsappGroupUrl(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: "#44445A" }}>
                Los invitados veran un boton para unirse al grupo al escanear el QR.
              </p>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60 transition-all"
              style={{
                background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                color: "#fff",
              }}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            {saveMessage && (
              <p
                className="text-xs text-center py-2 rounded-lg"
                style={{
                  color: saveMessage.includes("Error") ? "#EF4444" : "#10B981",
                  background: saveMessage.includes("Error") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                }}
              >
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Registrations Tab ──────────────────────────── */}
      {activeTab === "registrations" && (
        <div className="rounded-2xl p-4" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black tracking-tight" style={{ color: "#F0F0FF" }}>
              Invitados registrados ({registrations.length})
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
              ● En vivo
            </span>
          </div>

          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#44445A" }}>
                Aun no hay invitados registrados
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-start gap-4">
                    {/* Selfie */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid rgba(255,45,120,0.25)", background: "rgba(255,45,120,0.08)" }}>
                      {reg.selfie_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={reg.selfie_url}
                          alt={reg.user.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-xl font-black" style={{ color: "#FF2D78" }}>
                          {(reg.user.full_name || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-bold" style={{ color: "#F0F0FF" }}>
                          {reg.user.full_name || "Sin nombre"}
                        </p>
                        {reg.search_started_at ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                            ● Buscando
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: "rgba(133,133,168,0.12)", color: "#8585A8" }}>
                            Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#8585A8" }}>{reg.user.email}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(26,110,255,0.12)", color: "#60A5FA" }}>
                          {GENDER_LABELS[reg.gender] ?? reg.gender}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,45,120,0.12)", color: "#FF6BA8" }}>
                          Busca: {LOOKING_LABELS[reg.looking_for] ?? reg.looking_for}
                        </span>
                        {reg.table_number && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,184,0,0.12)", color: "#FFB800" }}>
                            Mesa {reg.table_number}
                          </span>
                        )}
                        {reg.relation_type && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(123,47,190,0.12)", color: "#A855F7" }}>
                            {getRelationLabel(reg.relation_type) ?? reg.relation_type}
                          </span>
                        )}
                      </div>
                      {reg.interests && reg.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reg.interests.slice(0, 5).map((interest) => (
                            <span key={interest} className="text-xs px-1.5 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: "#44445A", border: "1px solid rgba(255,255,255,0.06)" }}>
                              {interest}
                            </span>
                          ))}
                          {reg.interests.length > 5 && (
                            <span className="text-xs px-1.5 py-0.5" style={{ color: "#44445A" }}>
                              +{reg.interests.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "#44445A" }}>
                    {new Date(reg.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Matches Tab ────────────────────────────────── */}
      {activeTab === "matches" && (
        <div className="rounded-2xl p-4" style={cardStyle}>
          <h3 className="text-sm font-black tracking-tight mb-4" style={{ color: "#F0F0FF" }}>
            Matches ({matches.length})
          </h3>

          {matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#44445A" }}>
                Aun no hay matches en este evento
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  {/* User A avatar */}
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(255,45,120,0.1)", color: "#FF2D78" }}
                  >
                    {m.user_a.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.user_a.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      m.user_a.full_name?.charAt(0) ?? "?"
                    )}
                  </div>

                  {/* Heart icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF2D78" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>

                  {/* User B avatar */}
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(123,47,190,0.1)", color: "#7B2FBE" }}
                  >
                    {m.user_b.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.user_b.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      m.user_b.full_name?.charAt(0) ?? "?"
                    )}
                  </div>

                  {/* Names */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#F0F0FF" }}>
                      {m.user_a.full_name} & {m.user_b.full_name}
                    </p>
                  </div>

                  {/* Date */}
                  <p className="text-xs flex-shrink-0" style={{ color: "#44445A" }}>
                    {new Date(m.matched_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Reviews Tab ───────────────────────── */}
      {activeTab === "reviews" && (
        <div className="rounded-2xl p-4" style={cardStyle}>
          <h3 className="text-sm font-black tracking-tight mb-4" style={{ color: "#F0F0FF" }}>
            Resenas ({reviewStats?.total ?? 0})
          </h3>

          {/* Stats summary */}
          {reviewStats && reviewStats.total > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,184,0,0.06)", border: "1px solid rgba(255,184,0,0.1)" }}>
                <p className="text-xl font-black" style={{ color: "#FFB800" }}>{reviewStats.average}</p>
                <p className="text-[10px]" style={{ color: "#8585A8" }}>Promedio</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                <p className="text-xl font-black" style={{ color: "#10B981" }}>{reviewStats.wouldUseAgain}</p>
                <p className="text-[10px]" style={{ color: "#8585A8" }}>La usarian de nuevo</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,45,120,0.06)", border: "1px solid rgba(255,45,120,0.1)" }}>
                <p className="text-xl font-black" style={{ color: "#FF2D78" }}>{reviewStats.total}</p>
                <p className="text-[10px]" style={{ color: "#8585A8" }}>Total</p>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#44445A" }}>Aun no hay resenas para este evento</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {reviews.map((r, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#F0F0FF" }}>{r.user.full_name}</p>
                      <p className="text-[10px]" style={{ color: "#44445A" }}>{r.user.email}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} width={12} height={12} viewBox="0 0 24 24" fill={s <= r.rating ? "#FFB800" : "none"} stroke={s <= r.rating ? "#FFB800" : "#44445A"} strokeWidth={1.5}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs my-1" style={{ color: "#8585A8" }}>{r.comment}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: r.would_use_again ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: r.would_use_again ? "#10B981" : "#EF4444",
                      }}>
                      {r.would_use_again ? "La usaria de nuevo" : "No la usaria"}
                    </span>
                    <span className="text-[10px]" style={{ color: "#44445A" }}>
                      {new Date(r.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
