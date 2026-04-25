"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";

/* ─── Types ─── */

type EventData = {
  id: string;
  name: string;
  type: string;
  status: string;
  plan: string;
  event_date: string;
  venue_name: string | null;
  venue_city: string | null;
  language: string;
  gender_extended_mode: boolean;
  match_mode: "swipe" | "mosaic";
  super_likes_max: number;
  search_duration_minutes: number;
  search_start_time: string | null;
  search_end_time: string | null;
  expiry_days: number;
  unique_slug: string;
  qr_code_url: string | null;
  max_guests: number | null;
  plan_guest_limit: number | null;
  organizer_id: string;
  hosts: { id: string; label: string | null; user: { full_name: string; email: string; avatar_url: string | null } }[];
  access_codes: { id: string; code: string }[];
  _count: { registrations: number; matches: number; photos: number };
};

type EventStats = {
  registrations: number;
  searchesStarted: number;
  totalLikes: number;
  likesByType: { like: number; dislike: number; super_like: number };
  matches: number;
  photos: { visible: number; pending: number; total: number };
  genderBreakdown: Record<string, number>;
  lookingForBreakdown: Record<string, number>;
};

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
  user: { id: string; full_name: string; email: string; avatar_url: string | null };
};

type Match = {
  id: string;
  matched_at: string;
  user_a: { full_name: string; avatar_url: string | null };
  user_b: { full_name: string; avatar_url: string | null };
  _count: { messages: number };
};

type Photo = {
  id: string;
  cloudinary_url: string;
  thumbnail_url: string | null;
  is_visible: boolean;
  taken_at: string;
  user: { full_name: string };
};

type Like = {
  id: string;
  type: string;
  created_at: string;
  from_user: { full_name: string };
  to_user: { full_name: string };
};

type AnalyticsMatch = {
  id: string;
  matched_at: string;
  initiated_by: string | null;
  user_a: { id: string; full_name: string; avatar_url: string | null; selfie_url: string | null; gender: string | null };
  user_b: { id: string; full_name: string; avatar_url: string | null; selfie_url: string | null; gender: string | null };
  shared_interests: string[];
  affinity_percent: number;
  messages_count: number;
};

type Analytics = {
  summary: {
    registrations_total: number;
    likes_total: number;
    likes_positive: number;
    super_likes_total: number;
    dislikes_total: number;
    matches_total: number;
    avg_affinity_percent: number;
    match_conversion_percent: number;
    messages_total: number;
  };
  likes_by_type: Record<string, number>;
  likes_by_gender_pair: Record<string, number>;
  gender_distribution: Record<string, number>;
  top_liked: { user_id: string; count: number; display_name: string | null; selfie_url: string | null }[];
  matches: AnalyticsMatch[];
};

type AccessCode = {
  id: string;
  code: string;
  type: string;
  assigned_to_email: string | null;
  used_by: string | null;
  used_at: string | null;
  is_active: boolean;
  created_at: string;
};

/* ─── Constants ─── */

const STATUS_COLOR: Record<string, string> = {
  draft: "#8585A8",
  active: "#10B981",
  closed: "#EF4444",
  expired: "#F59E0B",
};

const PLAN_COLOR: Record<string, string> = {
  spark: "#8585A8",
  connect: "#1A6EFF",
  vibe: "#7B2FBE",
  luxe: "#FFB800",
  elite: "#FF2D78",
  exclusive: "#10B981",
};

const TABS = ["info", "registros", "matches", "fotos", "likes", "codigos"] as const;
type Tab = (typeof TABS)[number];

const GENDER_LABEL: Record<string, string> = {
  male: "Hombre",
  female: "Mujer",
  non_binary: "No binario",
  prefer_not_say: "Prefiere no decir",
};

const LOOKING_LABEL: Record<string, string> = {
  men: "Hombres",
  women: "Mujeres",
  everyone: "Todos",
  non_binary: "No binario",
};

const LIKE_TYPE_LABEL: Record<string, string> = {
  like: "Like",
  dislike: "Dislike",
  super_like: "Super Like",
};

const LIKE_TYPE_COLOR: Record<string, string> = {
  like: "#10B981",
  dislike: "#EF4444",
  super_like: "#FFB800",
};

/* ─── Component ─── */

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [tab, setTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editDuration, setEditDuration] = useState(60);
  const [editExpiry, setEditExpiry] = useState(3);
  const [editPlan, setEditPlan] = useState("");
  const [editMaxGuests, setEditMaxGuests] = useState<number | "">("");
  const [editStatus, setEditStatus] = useState("");
  const [editMatchMode, setEditMatchMode] = useState<"swipe" | "mosaic">("mosaic");
  const [editSuperLikesMax, setEditSuperLikesMax] = useState<number>(1);
  const [editGenderExtended, setEditGenderExtended] = useState<boolean>(false);
  const [editStartHour, setEditStartHour] = useState<number>(21);
  const [editStartMinute, setEditStartMinute] = useState<number>(0);
  const [editStartEnabled, setEditStartEnabled] = useState<boolean>(false);

  // Tab data
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // New code creation
  const [newCodeType, setNewCodeType] = useState("global");
  const [newCodeEmail, setNewCodeEmail] = useState("");
  const [creatingCode, setCreatingCode] = useState(false);

  // QR codes per access code
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [expandedQr, setExpandedQr] = useState<string | null>(null);

  // Main QR color picker
  const [qrColorKey, setQrColorKey] = useState<"pink" | "purple" | "blackOnWhite" | "whiteOnBlack">("pink");
  const [mainQrUrl, setMainQrUrl] = useState<string>("");

  const loadEvent = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, stRes] = await Promise.all([
        fetch(`/api/v1/events/${id}`),
        fetch(`/api/v1/events/${id}/stats`),
      ]);
      const evData = await evRes.json();
      const stData = await stRes.json();

      if (evData.event) {
        const ev = evData.event;
        setEvent(ev);
        setEditName(ev.name);
        setEditDate(ev.event_date?.slice(0, 10) ?? "");
        setEditVenue(ev.venue_name ?? "");
        setEditDuration(ev.search_duration_minutes);
        setEditExpiry(ev.expiry_days);
        setEditPlan(ev.plan);
        setEditMaxGuests(ev.max_guests ?? "");
        setEditStatus(ev.status);
        setEditMatchMode(ev.match_mode ?? "mosaic");
        setEditSuperLikesMax(ev.super_likes_max ?? 1);
        setEditGenderExtended(!!ev.gender_extended_mode);
        if (ev.search_start_time) {
          const startDate = new Date(ev.search_start_time);
          setEditStartHour(startDate.getHours());
          setEditStartMinute(startDate.getMinutes());
          setEditStartEnabled(true);
        } else {
          setEditStartEnabled(false);
        }
      }
      if (stData.registrations !== undefined) {
        setStats(stData);
      }
    } catch {
      // error
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // Load tab data when switching tabs
  useEffect(() => {
    if (!id) return;
    if (tab === "info") return;

    setTabLoading(true);

    if (tab === "registros") {
      fetch(`/api/v1/events/${id}/registrations`)
        .then((r) => r.json())
        .then((d) => {
          setRegistrations(d.registrations ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    } else if (tab === "matches") {
      setAnalyticsLoading(true);
      Promise.all([
        fetch(`/api/v1/events/${id}/matches`).then((r) => r.json()),
        fetch(`/api/v1/events/${id}/analytics`).then((r) => r.json()),
      ])
        .then(([mData, aData]) => {
          setMatches(mData.matches ?? []);
          if (!aData.error) setAnalytics(aData);
          setTabLoading(false);
          setAnalyticsLoading(false);
        })
        .catch(() => { setTabLoading(false); setAnalyticsLoading(false); });
    } else if (tab === "fotos") {
      fetch(`/api/v1/events/${id}/photos`)
        .then((r) => r.json())
        .then((d) => {
          setPhotos(d.photos ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    } else if (tab === "likes") {
      setAnalyticsLoading(true);
      Promise.all([
        fetch(`/api/v1/events/${id}/likes`).then((r) => r.json()),
        fetch(`/api/v1/events/${id}/analytics`).then((r) => r.json()),
      ])
        .then(([lData, aData]) => {
          setLikes(lData.likes ?? []);
          if (!aData.error) setAnalytics(aData);
          setTabLoading(false);
          setAnalyticsLoading(false);
        })
        .catch(() => { setTabLoading(false); setAnalyticsLoading(false); });
    } else if (tab === "codigos") {
      fetch(`/api/v1/events/${id}/codes`)
        .then((r) => r.json())
        .then((d) => {
          setAccessCodes(d.codes ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    }
  }, [tab, id]);

  // Real-time polling for registrations tab
  useEffect(() => {
    if (tab !== "registros" || !id) return;
    const interval = setInterval(() => {
      fetch(`/api/v1/events/${id}/registrations`)
        .then((r) => r.json())
        .then((d) => { if (d.registrations) setRegistrations(d.registrations); })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [tab, id]);

  // Generate QR codes for each access code
  useEffect(() => {
    if (!event || accessCodes.length === 0) return;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    async function generateQRs() {
      const urls: Record<string, string> = {};
      for (const ac of accessCodes) {
        const eventUrl = `${baseUrl}/e/${event!.unique_slug}?code=${encodeURIComponent(ac.code)}`;
        try {
          urls[ac.id] = await QRCode.toDataURL(eventUrl, {
            width: 400,
            margin: 2,
            color: { dark: "#FF2D78", light: "#0A0A0F" },
          });
        } catch {
          // skip
        }
      }
      setQrUrls(urls);
    }
    generateQRs();
  }, [accessCodes, event]);

  // Regenerate main QR on color change
  useEffect(() => {
    if (!event) return;
    const globalCode = event.access_codes?.[0]?.code;
    if (!globalCode) return;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const eventUrl = `${baseUrl}/e/${event.unique_slug}?code=${encodeURIComponent(globalCode)}`;
    const palette: Record<typeof qrColorKey, { dark: string; light: string }> = {
      pink: { dark: "#FF2D78", light: "#0A0A0F" },
      purple: { dark: "#7B2FBE", light: "#0A0A0F" },
      blackOnWhite: { dark: "#000000", light: "#FFFFFF" },
      whiteOnBlack: { dark: "#FFFFFF", light: "#000000" },
    };
    QRCode.toDataURL(eventUrl, { width: 600, margin: 2, color: palette[qrColorKey] })
      .then(setMainQrUrl)
      .catch(() => {});
  }, [event, qrColorKey]);

  function downloadCodeQR(ac: AccessCode) {
    const dataUrl = qrUrls[ac.id];
    if (!dataUrl || !event) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${event.unique_slug}-${ac.code}.png`;
    a.click();
  }

  function copyCodeLink(ac: AccessCode) {
    if (!event) return;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/e/${event.unique_slug}?code=${encodeURIComponent(ac.code)}`;
    navigator.clipboard.writeText(url);
  }

  async function saveChanges() {
    setSaving(true);
    setSaveMsg("");
    try {
      const body: Record<string, unknown> = {
        name: editName,
        event_date: editDate,
        venue_name: editVenue,
        search_duration_minutes: editDuration,
        expiry_days: editExpiry,
        plan: editPlan,
        status: editStatus,
        match_mode: editMatchMode,
        super_likes_max: editSuperLikesMax,
        gender_extended_mode: editGenderExtended,
      };
      if (editMaxGuests !== "") body.max_guests = Number(editMaxGuests);

      // Search window — recompute start + end from selected hour/minute against event date
      if (editStartEnabled && editDate) {
        const start = new Date(editDate);
        start.setHours(editStartHour, editStartMinute, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + editDuration);
        body.search_start_time = start.toISOString();
        body.search_end_time = end.toISOString();
      } else {
        body.search_start_time = null;
        body.search_end_time = null;
      }

      const res = await fetch(`/api/v1/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaveMsg("Guardado correctamente");
        loadEvent();
      } else {
        setSaveMsg("Error al guardar");
      }
    } catch {
      setSaveMsg("Error de red");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function changeStatus(newStatus: string) {
    if (newStatus === "closed") {
      const res = await fetch(`/api/v1/events/${id}`, { method: "DELETE" });
      if (res.ok) loadEvent();
    } else {
      const res = await fetch(`/api/v1/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) loadEvent();
    }
  }

  async function createAccessCode() {
    setCreatingCode(true);
    try {
      const res = await fetch(`/api/v1/events/${id}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newCodeType,
          assigned_to_email: newCodeEmail || null,
        }),
      });
      if (res.ok) {
        setNewCodeEmail("");
        const codesRes = await fetch(`/api/v1/events/${id}/codes`);
        const codesData = await codesRes.json();
        setAccessCodes(codesData.codes ?? []);
      }
    } catch {
      // error
    }
    setCreatingCode(false);
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 rounded mb-2 animate-pulse" style={{ background: "#1a1a2e" }} />
        <div className="h-4 w-64 rounded mb-6 animate-pulse" style={{ background: "#1a1a2e" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ background: "#0F0F1A" }}
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: "#0F0F1A" }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 lg:p-8 max-w-6xl mx-auto text-center py-20">
        <p style={{ color: "#8585A8" }}>Evento no encontrado</p>
        <button
          onClick={() => router.push("/admin/events")}
          className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
        >
          Volver a eventos
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/events")}
        className="flex items-center gap-1 text-sm font-semibold mb-4"
        style={{ color: "#8585A8" }}
      >
        <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "#F0F0FF" }}>
              {event.name}
            </h1>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
              style={{
                background: `${STATUS_COLOR[event.status] ?? "#555"}22`,
                color: STATUS_COLOR[event.status] ?? "#555",
              }}
            >
              {event.status}
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase"
              style={{
                background: `${PLAN_COLOR[event.plan] ?? "#555"}22`,
                color: PLAN_COLOR[event.plan] ?? "#555",
              }}
            >
              {event.plan}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#8585A8" }}>
            {event.unique_slug}
          </p>
        </div>

        {/* Status actions */}
        <div className="flex gap-2 flex-wrap">
          {event.status !== "active" && (
            <button
              onClick={() => changeStatus("active")}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
            >
              Activar
            </button>
          )}
          {event.status !== "closed" && (
            <button
              onClick={() => changeStatus("closed")}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
            >
              Cerrar
            </button>
          )}
          {event.status !== "draft" && (
            <button
              onClick={() => changeStatus("draft")}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(133,133,168,0.15)", color: "#8585A8" }}
            >
              A Borrador
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Registros", value: stats.registrations, color: "#1A6EFF" },
            { label: "Matches", value: stats.matches, color: "#FF2D78" },
            { label: "Likes", value: stats.totalLikes, color: "#10B981" },
            { label: "Fotos", value: stats.photos.total, color: "#7B2FBE" },
            { label: "Busquedas", value: stats.searchesStarted, color: "#FFB800" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4"
              style={{
                background: "#0F0F1A",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-2xl font-black" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs font-semibold" style={{ color: "#8585A8" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gender / Looking For Breakdown */}
      {stats && (
        <div className="grid lg:grid-cols-2 gap-3 mb-6">
          <div
            className="rounded-2xl p-4"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8585A8" }}>
              Genero de invitados
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.genderBreakdown).map(([g, count]) => (
                <div key={g} className="text-center">
                  <div className="text-lg font-bold" style={{ color: "#F0F0FF" }}>
                    {count}
                  </div>
                  <div className="text-xs" style={{ color: "#44445A" }}>
                    {GENDER_LABEL[g] ?? g}
                  </div>
                </div>
              ))}
              {Object.keys(stats.genderBreakdown).length === 0 && (
                <p className="text-xs" style={{ color: "#44445A" }}>
                  Sin datos
                </p>
              )}
            </div>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8585A8" }}>
              Buscan
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.lookingForBreakdown).map(([l, count]) => (
                <div key={l} className="text-center">
                  <div className="text-lg font-bold" style={{ color: "#F0F0FF" }}>
                    {count}
                  </div>
                  <div className="text-xs" style={{ color: "#44445A" }}>
                    {LOOKING_LABEL[l] ?? l}
                  </div>
                </div>
              ))}
              {Object.keys(stats.lookingForBreakdown).length === 0 && (
                <p className="text-xs" style={{ color: "#44445A" }}>
                  Sin datos
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors"
            style={{
              background: tab === t ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === t ? "#FF2D78" : "rgba(255,255,255,0.06)"}`,
              color: tab === t ? "#FF2D78" : "#8585A8",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="rounded-2xl p-4 lg:p-6"
        style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* ─── INFO TAB ─── */}
        {tab === "info" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ color: "#F0F0FF" }}>
              Informacion del Evento
            </h2>

            {/* Read-only info */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <InfoRow label="Organizador" value={`${event.organizer_id}`} />
              <InfoRow label="Tipo" value={event.type} />
              <InfoRow label="Idioma" value={event.language} />
              <InfoRow
                label="Modo genero extendido"
                value={event.gender_extended_mode ? "Si" : "No"}
              />
              <InfoRow
                label="Modo matching"
                value={event.match_mode === "swipe" ? "Swipe" : "Mosaico"}
              />
              <InfoRow
                label="Super likes por persona"
                value={String(event.super_likes_max ?? 1)}
              />
              <InfoRow label="Slug" value={event.unique_slug} />
              {(mainQrUrl || event.qr_code_url) && (
                <div className="lg:col-span-2">
                  <label className="text-xs font-semibold block mb-2" style={{ color: "#8585A8" }}>
                    Codigo QR
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainQrUrl || event.qr_code_url || ""}
                      alt="QR"
                      className="w-32 h-32 rounded-xl shrink-0"
                      style={{ background: qrColorKey === "blackOnWhite" ? "#FFF" : qrColorKey === "whiteOnBlack" ? "#000" : "#0A0A0F" }}
                    />
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#44445A" }}>
                        Color
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {([
                          { k: "pink", label: "Rosa", swatch: "#FF2D78", bg: "#0A0A0F" },
                          { k: "purple", label: "Morado", swatch: "#7B2FBE", bg: "#0A0A0F" },
                          { k: "blackOnWhite", label: "Negro / blanco", swatch: "#000000", bg: "#FFFFFF" },
                          { k: "whiteOnBlack", label: "Blanco / negro", swatch: "#FFFFFF", bg: "#000000" },
                        ] as const).map((opt) => {
                          const active = qrColorKey === opt.k;
                          return (
                            <button
                              key={opt.k}
                              type="button"
                              onClick={() => setQrColorKey(opt.k)}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors text-left"
                              style={{
                                background: active ? "rgba(255,45,120,0.12)" : "rgba(255,255,255,0.04)",
                                border: `1px solid ${active ? "rgba(255,45,120,0.4)" : "rgba(255,255,255,0.06)"}`,
                                color: active ? "#FF2D78" : "#F0F0FF",
                              }}
                            >
                              <span
                                className="w-5 h-5 rounded shrink-0"
                                style={{ background: opt.bg, border: "1px solid rgba(255,255,255,0.15)" }}
                              >
                                <span className="block w-full h-full" style={{
                                  background: `repeating-conic-gradient(${opt.swatch} 0% 25%, transparent 0% 50%) 50% / 50% 50%`,
                                }} />
                              </span>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      <a
                        href={mainQrUrl || event.qr_code_url || ""}
                        download={`qr-${event.unique_slug}-${qrColorKey}.png`}
                        className="self-start mt-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(26,110,255,0.15)", color: "#1A6EFF" }}
                      >
                        Descargar PNG
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hosts */}
            {event.hosts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#8585A8" }}>
                  Hosts ({event.hosts.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {event.hosts.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 p-2 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold overflow-hidden"
                        style={{ background: "rgba(26,110,255,0.15)", color: "#1A6EFF" }}
                      >
                        {h.user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={h.user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          h.user.full_name?.charAt(0) ?? "?"
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#F0F0FF" }}>
                          {h.user.full_name}
                          {h.label && (
                            <span className="ml-2 text-xs" style={{ color: "#44445A" }}>
                              ({h.label})
                            </span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: "#8585A8" }}>
                          {h.user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editable fields */}
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#FFB800" }}>
              Editar Evento
            </h3>
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              <EditField label="Nombre" value={editName} onChange={setEditName} />
              <EditField label="Fecha" value={editDate} onChange={setEditDate} type="date" />
              <EditField label="Lugar" value={editVenue} onChange={setEditVenue} />
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
                  Duracion del swipe
                </label>
                <select
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#16162a", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0FF" }}
                >
                  {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((m) => (
                    <option key={m} value={m} style={{ background: "#0F0F1A" }}>{m} min</option>
                  ))}
                  {[120, 180, 240, 300, 360].map((m) => (
                    <option key={m} value={m} style={{ background: "#0F0F1A" }}>{m / 60} hrs</option>
                  ))}
                </select>
                <p className="text-[10px] mt-1" style={{ color: "#44445A" }}>
                  De 5 en 5 hasta 1 h, despues de hora en hora hasta 6 h.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
                  Hora de inicio del swipe
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStartEnabled((v) => !v)}
                    className="w-12 h-6 rounded-full transition-all relative shrink-0"
                    style={{ background: editStartEnabled ? "#FF2D78" : "rgba(255,255,255,0.08)" }}
                    aria-pressed={editStartEnabled}
                  >
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: editStartEnabled ? "calc(100% - 22px)" : "2px" }} />
                  </button>
                  <select
                    value={editStartHour}
                    onChange={(e) => setEditStartHour(Number(e.target.value))}
                    disabled={!editStartEnabled}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none disabled:opacity-40"
                    style={{ background: "#16162a", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0FF" }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} style={{ background: "#0F0F1A" }}>{String(i).padStart(2, "0")} h</option>
                    ))}
                  </select>
                  <select
                    value={editStartMinute}
                    onChange={(e) => setEditStartMinute(Number(e.target.value))}
                    disabled={!editStartEnabled}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none disabled:opacity-40"
                    style={{ background: "#16162a", border: "1px solid rgba(255,255,255,0.08)", color: "#F0F0FF" }}
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                      <option key={m} value={m} style={{ background: "#0F0F1A" }}>{String(m).padStart(2, "0")} min</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] mt-1" style={{ color: "#44445A" }}>
                  {editStartEnabled
                    ? "El swipe abre solo a esa hora del dia del evento."
                    : "Cada invitado arranca su timer al pulsar Iniciar."}
                </p>
              </div>
              <EditField
                label="Dias de expiracion"
                value={String(editExpiry)}
                onChange={(v) => setEditExpiry(Number(v))}
                type="number"
              />
              <EditField
                label="Max invitados"
                value={editMaxGuests === "" ? "" : String(editMaxGuests)}
                onChange={(v) => setEditMaxGuests(v === "" ? "" : Number(v))}
                type="number"
                placeholder="Sin limite"
              />
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
                  Modo de matching
                </label>
                <div className="flex gap-2">
                  {(["mosaic", "swipe"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEditMatchMode(m)}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      style={{
                        background: editMatchMode === m ? "rgba(255,45,120,0.18)" : "#16162a",
                        border: `1px solid ${editMatchMode === m ? "rgba(255,45,120,0.45)" : "rgba(255,255,255,0.08)"}`,
                        color: editMatchMode === m ? "#FF2D78" : "#F0F0FF",
                      }}
                    >
                      {m === "mosaic" ? "Mosaico" : "Swipe"}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] mt-1" style={{ color: "#44445A" }}>
                  Mosaico: grid 2 col scrollable. Swipe: tarjetas tipo Tinder.
                </p>
              </div>
              <EditField
                label="Super likes por persona"
                value={String(editSuperLikesMax)}
                onChange={(v) => setEditSuperLikesMax(Math.max(0, Math.min(20, Number(v) || 0)))}
                type="number"
                placeholder="1"
              />
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
                  Generos extendidos
                </label>
                <div className="flex gap-2">
                  {[
                    { v: true, label: "Activado" },
                    { v: false, label: "Solo H/M" },
                  ].map((opt) => (
                    <button
                      key={String(opt.v)}
                      type="button"
                      onClick={() => setEditGenderExtended(opt.v)}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      style={{
                        background: editGenderExtended === opt.v ? "rgba(26,110,255,0.18)" : "#16162a",
                        border: `1px solid ${editGenderExtended === opt.v ? "rgba(26,110,255,0.45)" : "rgba(255,255,255,0.08)"}`,
                        color: editGenderExtended === opt.v ? "#1A6EFF" : "#F0F0FF",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] mt-1" style={{ color: "#44445A" }}>
                  Si esta off, el wizard solo permite hombre/mujer.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
                  Plan
                </label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "#16162a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#F0F0FF",
                  }}
                >
                  {["spark", "connect", "vibe", "luxe", "elite", "exclusive"].map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
                  Estado
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "#16162a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#F0F0FF",
                  }}
                >
                  {["draft", "active", "closed", "expired"].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                  color: "#fff",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              {saveMsg && (
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: saveMsg.includes("Error") ? "#EF4444" : "#10B981",
                  }}
                >
                  {saveMsg}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ─── REGISTRATIONS TAB ─── */}
        {tab === "registros" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ color: "#F0F0FF" }}>
              Registros ({registrations.length})
            </h2>
            {tabLoading ? (
              <TabSkeleton />
            ) : registrations.length === 0 ? (
              <EmptyTab message="No hay registros en este evento" />
            ) : (
              <div className="flex flex-col gap-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selfie */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ border: "2px solid rgba(255,45,120,0.3)", background: "rgba(255,45,120,0.08)" }}>
                        {reg.selfie_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={reg.selfie_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-black" style={{ color: "#FF2D78" }}>
                            {(reg.user.full_name || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
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
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(123,47,190,0.15)", color: "#A855F7" }}>
                            {GENDER_LABEL[reg.gender] ?? reg.gender}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,45,120,0.12)", color: "#FF6BA8" }}>
                            Busca: {LOOKING_LABEL[reg.looking_for] ?? reg.looking_for}
                          </span>
                          {reg.table_number && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(26,110,255,0.12)", color: "#60A5FA" }}>
                              Mesa {reg.table_number}
                            </span>
                          )}
                          {reg.relation_type && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#8585A8" }}>
                              {reg.relation_type}
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
                              <span className="text-xs px-1.5 py-0.5 rounded-lg" style={{ color: "#44445A" }}>
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

        {/* ─── MATCHES TAB ─── */}
        {tab === "matches" && (
          <MatchesDashboard
            tabLoading={tabLoading}
            analyticsLoading={analyticsLoading}
            analytics={analytics}
          />
        )}

        {/* ─── PHOTOS TAB ─── */}
        {tab === "fotos" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ color: "#F0F0FF" }}>
              Fotos ({photos.length})
            </h2>
            {tabLoading ? (
              <TabSkeleton />
            ) : photos.length === 0 ? (
              <EmptyTab message="No hay fotos en este evento" />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {photos.map((p) => (
                  <div key={p.id} className="rounded-xl overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnail_url || p.cloudinary_url}
                      alt=""
                      className="w-full aspect-square object-cover"
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 p-2"
                      style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}
                    >
                      <p className="text-xs font-semibold truncate" style={{ color: "#F0F0FF" }}>
                        {p.user.full_name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#44445A" }}>
                          {new Date(p.taken_at).toLocaleDateString("es-MX")}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{
                            background: p.is_visible ? "rgba(16,185,129,0.3)" : "rgba(133,133,168,0.3)",
                            color: p.is_visible ? "#10B981" : "#8585A8",
                          }}
                        >
                          {p.is_visible ? "Visible" : "Oculta"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── LIKES TAB ─── */}
        {tab === "likes" && (
          <LikesDashboard
            tabLoading={tabLoading}
            analyticsLoading={analyticsLoading}
            analytics={analytics}
            likes={likes}
          />
        )}

        {/* ─── ACCESS CODES TAB ─── */}
        {tab === "codigos" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ color: "#F0F0FF" }}>
              Codigos de Acceso ({accessCodes.length})
            </h2>

            {/* Create new code */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#FFB800" }}>
                Crear nuevo codigo
              </h3>
              <div className="flex flex-col lg:flex-row gap-3">
                <select
                  value={newCodeType}
                  onChange={(e) => setNewCodeType(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: "#16162a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#F0F0FF",
                  }}
                >
                  <option value="global">Global</option>
                  <option value="individual">Individual</option>
                </select>
                {newCodeType === "individual" && (
                  <input
                    value={newCodeEmail}
                    onChange={(e) => setNewCodeEmail(e.target.value)}
                    placeholder="Email del invitado..."
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "#16162a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#F0F0FF",
                    }}
                  />
                )}
                <button
                  onClick={createAccessCode}
                  disabled={creatingCode}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
                >
                  {creatingCode ? "Creando..." : "Crear Codigo"}
                </button>
              </div>
            </div>

            {tabLoading ? (
              <TabSkeleton />
            ) : accessCodes.length === 0 ? (
              <EmptyTab message="No hay codigos de acceso" />
            ) : (
              <div className="flex flex-col gap-3">
                {accessCodes.map((ac) => {
                  const isExpanded = expandedQr === ac.id;
                  const eventUrl = event
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/e/${event.unique_slug}?code=${encodeURIComponent(ac.code)}`
                    : "";
                  return (
                    <div
                      key={ac.id}
                      className="rounded-xl overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Mini QR thumbnail */}
                          {qrUrls[ac.id] && (
                            <button
                              onClick={() => setExpandedQr(isExpanded ? null : ac.id)}
                              className="shrink-0 rounded-lg overflow-hidden transition-all hover:scale-105"
                              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                              title="Ver QR"
                            >
                              <img src={qrUrls[ac.id]} alt="QR" width={48} height={48} />
                            </button>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-mono font-bold" style={{ color: "#F0F0FF" }}>
                              {ac.code}
                            </p>
                            <div className="flex gap-2 mt-0.5">
                              <span className="text-xs capitalize" style={{ color: "#8585A8" }}>
                                {ac.type}
                              </span>
                              {ac.assigned_to_email && (
                                <span className="text-xs truncate" style={{ color: "#44445A" }}>
                                  Para: {ac.assigned_to_email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background: ac.is_active
                                ? ac.used_by
                                  ? "rgba(133,133,168,0.15)"
                                  : "rgba(16,185,129,0.15)"
                                : "rgba(239,68,68,0.15)",
                              color: ac.is_active
                                ? ac.used_by
                                  ? "#8585A8"
                                  : "#10B981"
                                : "#EF4444",
                            }}
                          >
                            {ac.used_by ? "Usado" : ac.is_active ? "Activo" : "Inactivo"}
                          </span>
                          {ac.used_at && (
                            <p className="text-xs mt-0.5" style={{ color: "#44445A" }}>
                              {new Date(ac.used_at).toLocaleDateString("es-MX")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Expanded QR section */}
                      {isExpanded && qrUrls[ac.id] && (
                        <div
                          className="px-4 pb-4 pt-0 flex flex-col items-center gap-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <div className="rounded-xl overflow-hidden mt-3" style={{ border: "2px solid rgba(255,45,120,0.2)" }}>
                            <img src={qrUrls[ac.id]} alt={`QR para código ${ac.code}`} width={200} height={200} />
                          </div>
                          <p className="text-xs font-mono text-center break-all max-w-xs" style={{ color: "#44445A" }}>
                            {eventUrl}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadCodeQR(ac)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
                              style={{ background: "rgba(255,45,120,0.12)", color: "#FF2D78" }}
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                              </svg>
                              Descargar QR
                            </button>
                            <button
                              onClick={() => copyCodeLink(ac)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
                              style={{ background: "rgba(133,133,168,0.12)", color: "#8585A8" }}
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M16 3h5v5M10 14L20.2 3.8" />
                              </svg>
                              Copiar link
                            </button>
                            <a
                              href={eventUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
                              style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Probar flujo
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helper Components ─── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-0.5" style={{ color: "#8585A8" }}>
        {label}
      </label>
      <p className="text-sm" style={{ color: "#F0F0FF" }}>
        {value || "-"}
      </p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: "#16162a",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#F0F0FF",
        }}
      />
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 rounded-xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.03)" }}
        />
      ))}
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-sm" style={{ color: "#44445A" }}>
        {message}
      </p>
    </div>
  );
}

/* ─── Dashboard helpers ─── */

function StatCard({ label, value, color = "#F0F0FF", sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#44445A" }}>{label}</p>
      <p className="text-2xl font-black tracking-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: "#44445A" }}>{sub}</p>}
    </div>
  );
}

function GenderPairChart({ pairs, label, color }: { pairs: Record<string, number>; label: string; color: string }) {
  const entries: Array<{ key: string; from: string; to: string; count: number }> = [];
  for (const [key, count] of Object.entries(pairs)) {
    if (count === 0) continue;
    const [from, , to] = key.split("_");
    entries.push({ key, from, to, count });
  }
  entries.sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...entries.map((e) => e.count));

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8585A8" }}>{label}</p>
        <p className="text-xs" style={{ color: "#44445A" }}>Sin datos todavia.</p>
      </div>
    );
  }

  const labelFor = (k: string) => GENDER_LABEL[k] ?? k;
  const arrow = (from: string, to: string) => `${labelFor(from)} → ${labelFor(to)}`;

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8585A8" }}>{label}</p>
      <div className="flex flex-col gap-2.5">
        {entries.map((e) => (
          <div key={e.key} className="flex items-center gap-3">
            <span className="text-xs font-medium w-32 shrink-0" style={{ color: "#F0F0FF" }}>
              {arrow(e.from, e.to)}
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(e.count / max) * 100}%`, background: color, boxShadow: `0 0 8px ${color}66` }}
              />
            </div>
            <span className="text-xs font-bold w-8 text-right shrink-0" style={{ color }}>{e.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchesDashboard({ tabLoading, analyticsLoading, analytics }: {
  tabLoading: boolean;
  analyticsLoading: boolean;
  analytics: Analytics | null;
}) {
  if (tabLoading || analyticsLoading || !analytics) return <TabSkeleton />;
  const s = analytics.summary;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-black mb-0.5" style={{ color: "#F0F0FF" }}>Analitica de matches</h2>
        <p className="text-xs" style={{ color: "#44445A" }}>Resumen, afinidad por pareja y conversaciones generadas.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Matches" value={s.matches_total} color="#FF2D78" />
        <StatCard label="Afinidad promedio" value={`${s.avg_affinity_percent}%`} color="#7B2FBE" sub="Intereses en comun" />
        <StatCard label="Conversion" value={`${s.match_conversion_percent}%`} color="#1A6EFF" sub="Likers que matchearon" />
        <StatCard label="Mensajes enviados" value={s.messages_total} color="#10B981" />
      </div>

      {/* Match list with affinity */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#8585A8" }}>
          Matches del evento
        </p>
        {analytics.matches.length === 0 ? (
          <EmptyTab message="No hay matches todavia" />
        ) : (
          <div className="flex flex-col gap-2">
            {analytics.matches.map((m) => {
              const aPic = m.user_a.selfie_url || m.user_a.avatar_url;
              const bPic = m.user_b.selfie_url || m.user_b.avatar_url;
              const aff = m.affinity_percent;
              const affColor = aff >= 70 ? "#10B981" : aff >= 40 ? "#FFB800" : "#8585A8";
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ background: "rgba(255,45,120,0.15)" }}>
                    {aPic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={aPic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: "#FF2D78" }}>
                        {m.user_a.full_name?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#F0F0FF" }}>
                      {m.user_a.full_name}
                      <span style={{ color: "#FF2D78" }}> ♥ </span>
                      {m.user_b.full_name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px]" style={{ color: "#44445A" }}>
                        {new Date(m.matched_at).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {m.shared_interests.length > 0 && (
                        <span className="text-[11px]" style={{ color: "#7B2FBE" }}>
                          {m.shared_interests.length} intereses en comun
                        </span>
                      )}
                      <span className="text-[11px]" style={{ color: "#7B2FBE" }}>
                        {m.messages_count} msg
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#44445A" }}>Afinidad</span>
                    <span className="text-sm font-black" style={{ color: affColor }}>{aff}%</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ background: "rgba(255,45,120,0.15)" }}>
                    {bPic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={bPic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: "#FF2D78" }}>
                        {m.user_b.full_name?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LikesDashboard({ tabLoading, analyticsLoading, analytics, likes }: {
  tabLoading: boolean;
  analyticsLoading: boolean;
  analytics: Analytics | null;
  likes: Like[];
}) {
  if (tabLoading || analyticsLoading || !analytics) return <TabSkeleton />;
  const s = analytics.summary;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-black mb-0.5" style={{ color: "#F0F0FF" }}>Analitica de likes</h2>
        <p className="text-xs" style={{ color: "#44445A" }}>Quien le da like a quien, y cuanto se convierte en match.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Likes positivos" value={s.likes_positive} color="#10B981" />
        <StatCard label="Super likes" value={s.super_likes_total} color="#FFB800" />
        <StatCard label="Dislikes" value={s.dislikes_total} color="#EF4444" />
        <StatCard label="Conversion" value={`${s.match_conversion_percent}%`} color="#FF2D78" sub="A match" />
      </div>

      {/* Gender pair chart */}
      <GenderPairChart
        pairs={analytics.likes_by_gender_pair}
        label="Likes por genero (de → a)"
        color="#FF2D78"
      />

      {/* Top liked profiles */}
      {analytics.top_liked.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#8585A8" }}>
            Perfiles mas likeados
          </p>
          <div className="flex flex-col gap-2">
            {analytics.top_liked.map((t, i) => (
              <div key={t.user_id} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-black" style={{ color: i === 0 ? "#FFB800" : "#44445A" }}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ background: "rgba(255,45,120,0.15)" }}>
                  {t.selfie_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.selfie_url} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <span className="flex-1 text-sm truncate" style={{ color: "#F0F0FF" }}>{t.display_name ?? "Sin nombre"}</span>
                <span className="text-sm font-black" style={{ color: "#FF2D78" }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw likes log */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#8585A8" }}>
          Registro completo ({likes.length})
        </p>
        {likes.length === 0 ? (
          <EmptyTab message="No hay likes en este evento" />
        ) : (
          <div className="flex flex-col gap-1">
            {likes.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 min-w-[70px] text-center"
                  style={{
                    background: `${LIKE_TYPE_COLOR[l.type] ?? "#555"}20`,
                    color: LIKE_TYPE_COLOR[l.type] ?? "#555",
                  }}>
                  {LIKE_TYPE_LABEL[l.type] ?? l.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "#F0F0FF" }}>
                    <span className="font-semibold">{l.from_user.full_name}</span>
                    <span style={{ color: "#44445A" }}> → </span>
                    <span className="font-semibold">{l.to_user.full_name}</span>
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "#44445A" }}>
                  {new Date(l.created_at).toLocaleString("es-MX", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
