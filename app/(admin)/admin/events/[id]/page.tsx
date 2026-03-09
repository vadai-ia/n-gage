"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

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
  search_duration_minutes: number;
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
  search_started_at: string | null;
  created_at: string;
  user: { id: string; full_name: string; email: string };
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

  // Tab data
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // New code creation
  const [newCodeType, setNewCodeType] = useState("global");
  const [newCodeEmail, setNewCodeEmail] = useState("");
  const [creatingCode, setCreatingCode] = useState(false);

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
      fetch(`/api/v1/events/${id}/register`)
        .then((r) => r.json())
        .then((d) => {
          setRegistrations(d.registrations ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    } else if (tab === "matches") {
      fetch(`/api/v1/events/${id}/matches`)
        .then((r) => r.json())
        .then((d) => {
          setMatches(d.matches ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    } else if (tab === "fotos") {
      fetch(`/api/v1/events/${id}/photos`)
        .then((r) => r.json())
        .then((d) => {
          setPhotos(d.photos ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    } else if (tab === "likes") {
      fetch(`/api/v1/events/${id}/likes`)
        .then((r) => r.json())
        .then((d) => {
          setLikes(d.likes ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    } else if (tab === "codigos") {
      fetch(`/api/v1/events/${id}`)
        .then((r) => r.json())
        .then(async () => {
          // Fetch access codes separately
          const res = await fetch(`/api/v1/events/${id}`);
          const data = await res.json();
          setAccessCodes(data.event?.access_codes ?? []);
          setTabLoading(false);
        })
        .catch(() => setTabLoading(false));
    }
  }, [tab, id]);

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
      };
      if (editMaxGuests !== "") body.max_guests = Number(editMaxGuests);

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
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      // Use a direct prisma-backed API if available, or create via event patch
      const res = await fetch(`/api/v1/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_codes: {
            create: {
              code,
              type: newCodeType,
              assigned_to_email: newCodeEmail || null,
            },
          },
        }),
      });
      if (res.ok) {
        setNewCodeEmail("");
        // Reload codes
        setTab("codigos");
        const evRes = await fetch(`/api/v1/events/${id}`);
        const evData = await evRes.json();
        setAccessCodes(evData.event?.access_codes ?? []);
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
              <InfoRow label="Slug" value={event.unique_slug} />
              {event.qr_code_url && (
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "#8585A8" }}>
                    Codigo QR
                  </label>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.qr_code_url}
                      alt="QR"
                      className="w-20 h-20 rounded-xl"
                      style={{ background: "#fff" }}
                    />
                    <a
                      href={event.qr_code_url}
                      download={`qr-${event.unique_slug}.png`}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(26,110,255,0.15)", color: "#1A6EFF" }}
                    >
                      Descargar QR
                    </a>
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
              <EditField
                label="Duracion busqueda (min)"
                value={String(editDuration)}
                onChange={(v) => setEditDuration(Number(v))}
                type="number"
              />
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
              <div className="flex flex-col gap-2">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {/* Selfie */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reg.selfie_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#F0F0FF" }}>
                        {reg.user.full_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#8585A8" }}>
                        {reg.user.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs" style={{ color: "#44445A" }}>
                          {GENDER_LABEL[reg.gender] ?? reg.gender}
                        </span>
                        <span className="text-xs" style={{ color: "#44445A" }}>
                          Busca: {LOOKING_LABEL[reg.looking_for] ?? reg.looking_for}
                        </span>
                        {reg.table_number && (
                          <span className="text-xs" style={{ color: "#44445A" }}>
                            Mesa: {reg.table_number}
                          </span>
                        )}
                        {reg.relation_type && (
                          <span className="text-xs" style={{ color: "#44445A" }}>
                            {reg.relation_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {reg.search_started_at ? (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
                        >
                          Buscando
                        </span>
                      ) : (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(133,133,168,0.15)", color: "#8585A8" }}
                        >
                          Pendiente
                        </span>
                      )}
                      <p className="text-xs mt-1" style={{ color: "#44445A" }}>
                        {new Date(reg.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── MATCHES TAB ─── */}
        {tab === "matches" && (
          <div>
            <h2 className="text-sm font-bold mb-4" style={{ color: "#F0F0FF" }}>
              Matches ({matches.length})
            </h2>
            {tabLoading ? (
              <TabSkeleton />
            ) : matches.length === 0 ? (
              <EmptyTab message="No hay matches en este evento" />
            ) : (
              <div className="flex flex-col gap-2">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {/* User A avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0"
                      style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
                    >
                      {m.user_a.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.user_a.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        m.user_a.full_name?.charAt(0) ?? "?"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "#F0F0FF" }}>
                        {m.user_a.full_name}
                        <span style={{ color: "#FF2D78" }}> &hearts; </span>
                        {m.user_b.full_name}
                      </p>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: "#44445A" }}>
                          {new Date(m.matched_at).toLocaleDateString("es-MX")}
                        </span>
                        <span className="text-xs" style={{ color: "#7B2FBE" }}>
                          {m._count.messages} mensajes
                        </span>
                      </div>
                    </div>

                    {/* User B avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0"
                      style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
                    >
                      {m.user_b.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.user_b.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        m.user_b.full_name?.charAt(0) ?? "?"
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <div>
            <h2 className="text-sm font-bold mb-2" style={{ color: "#F0F0FF" }}>
              Likes ({likes.length})
            </h2>
            {stats && (
              <div className="flex gap-4 mb-4">
                <span className="text-xs" style={{ color: "#10B981" }}>
                  {stats.likesByType.like} likes
                </span>
                <span className="text-xs" style={{ color: "#EF4444" }}>
                  {stats.likesByType.dislike} dislikes
                </span>
                <span className="text-xs" style={{ color: "#FFB800" }}>
                  {stats.likesByType.super_like} super likes
                </span>
              </div>
            )}
            {tabLoading ? (
              <TabSkeleton />
            ) : likes.length === 0 ? (
              <EmptyTab message="No hay likes en este evento" />
            ) : (
              <div className="flex flex-col gap-1">
                {likes.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 min-w-[70px] text-center"
                      style={{
                        background: `${LIKE_TYPE_COLOR[l.type] ?? "#555"}20`,
                        color: LIKE_TYPE_COLOR[l.type] ?? "#555",
                      }}
                    >
                      {LIKE_TYPE_LABEL[l.type] ?? l.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: "#F0F0FF" }}>
                        <span className="font-semibold">{l.from_user.full_name}</span>
                        <span style={{ color: "#44445A" }}> &rarr; </span>
                        <span className="font-semibold">{l.to_user.full_name}</span>
                      </p>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "#44445A" }}>
                      {new Date(l.created_at).toLocaleString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              <div className="flex flex-col gap-2">
                {accessCodes.map((ac) => (
                  <div
                    key={ac.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div>
                      <p className="text-sm font-mono font-bold" style={{ color: "#F0F0FF" }}>
                        {ac.code}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs capitalize" style={{ color: "#8585A8" }}>
                          {ac.type}
                        </span>
                        {ac.assigned_to_email && (
                          <span className="text-xs" style={{ color: "#44445A" }}>
                            Para: {ac.assigned_to_email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
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
                ))}
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
