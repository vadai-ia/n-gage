"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ViewMode = "admin" | "organizer" | "host" | "guest";

type EventOption = {
  id: string;
  name: string;
  status: string;
};

const VIEW_LABELS: Record<ViewMode, string> = {
  admin:     "Super Admin",
  organizer: "Organizador",
  host:      "Host",
  guest:     "Invitado",
};

const VIEW_ICONS: Record<ViewMode, string> = {
  admin:     "🛡️",
  organizer: "🎪",
  host:      "🎤",
  guest:     "🎟️",
};

const VIEW_COLORS: Record<ViewMode, string> = {
  admin:     "#F59E0B",
  organizer: "#FF2D78",
  host:      "#7B2FBE",
  guest:     "#1A6EFF",
};

export default function ViewSwitcher() {
  const router = useRouter();
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [open,      setOpen]      = useState(false);
  const [viewMode,  setViewMode]  = useState<ViewMode>("admin");
  const [events,    setEvents]    = useState<EventOption[]>([]);
  const [picking,   setPicking]   = useState<"host" | "guest" | null>(null);
  const [loadingEv, setLoadingEv] = useState(false);

  // Detectar si el usuario real es SUPER_ADMIN
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === "SUPER_ADMIN") {
        setIsAdmin(true);
      }
    });
    // Restaurar modo guardado
    const saved = localStorage.getItem("ngage_view_mode") as ViewMode | null;
    if (saved) setViewMode(saved);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoadingEv(true);
    const res = await fetch("/api/v1/events");
    const data = await res.json();
    setEvents(data.events ?? []);
    setLoadingEv(false);
  }, []);

  function saveView(mode: ViewMode) {
    localStorage.setItem("ngage_view_mode", mode);
    setViewMode(mode);
  }

  async function switchTo(mode: ViewMode, eventId?: string) {
    saveView(mode);
    setOpen(false);
    setPicking(null);

    if (mode === "admin")     { router.push("/admin");         return; }
    if (mode === "organizer") { router.push("/dashboard");     return; }
    if (mode === "host"    && eventId) { router.push(`/host/${eventId}`);              return; }
    if (mode === "guest"   && eventId) { router.push(`/event/${eventId}/search`);      return; }
  }

  async function handleModeClick(mode: ViewMode) {
    if (mode === "host" || mode === "guest") {
      setPicking(mode);
      await fetchEvents();
    } else {
      await switchTo(mode);
    }
  }

  if (!isAdmin) return null;

  const color = VIEW_COLORS[viewMode];

  return (
    <>
      {/* Pill flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all"
        style={{
          background: `${color}22`,
          border: `1px solid ${color}66`,
          color,
          backdropFilter: "blur(8px)",
        }}
      >
        <span>{VIEW_ICONS[viewMode]}</span>
        <span>Vista: {VIEW_LABELS[viewMode]}</span>
        <span style={{ opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="fixed top-12 left-1/2 -translate-x-1/2 z-[9998] w-64 rounded-2xl p-3 shadow-2xl"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "#555" }}>
            Ver app como...
          </p>

          {(["admin", "organizer", "host", "guest"] as ViewMode[]).map((mode) => {
            const active = viewMode === mode;
            const c = VIEW_COLORS[mode];
            return (
              <button
                key={mode}
                onClick={() => handleModeClick(mode)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all"
                style={{
                  background: active ? `${c}22` : "transparent",
                  border: `1px solid ${active ? c + "55" : "transparent"}`,
                }}
              >
                <span className="text-lg">{VIEW_ICONS[mode]}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: active ? c : "#ccc" }}>
                    {VIEW_LABELS[mode]}
                  </p>
                  <p className="text-xs" style={{ color: "#555" }}>
                    {mode === "admin"     && "Panel de control"}
                    {mode === "organizer" && "Dashboard y eventos"}
                    {mode === "host"      && "Elige un evento →"}
                    {mode === "guest"     && "Elige un evento →"}
                  </p>
                </div>
                {active && <span className="text-xs" style={{ color: c }}>●</span>}
              </button>
            );
          })}

          <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs text-center" style={{ color: "#555" }}>
              Solo visible para Super Admin
            </p>
          </div>
        </div>
      )}

      {/* Modal: elegir evento (host o guest) */}
      {picking && (
        <div
          className="fixed inset-0 z-[9997] flex items-end justify-center pb-6 px-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => { setPicking(null); setOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-4"
            style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold mb-1">
              {picking === "host" ? "🎤 Ver como Host" : "🎟️ Ver como Invitado"}
            </p>
            <p className="text-xs mb-4" style={{ color: "#A0A0B0" }}>
              Selecciona el evento que quieres inspeccionar
            </p>

            {loadingEv ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "#0A0A0F" }} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "#555" }}>
                No hay eventos disponibles
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {events.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => switchTo(picking, ev.id)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-left"
                    style={{ background: "#0A0A0F", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-sm font-semibold truncate">{ev.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 capitalize"
                      style={{
                        background: ev.status === "active" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)",
                        color: ev.status === "active" ? "#10B981" : "#A0A0B0",
                      }}
                    >
                      {ev.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => { setPicking(null); setOpen(false); }}
              className="w-full mt-3 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(255,255,255,0.04)", color: "#A0A0B0" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Spacer para que el pill no tape el header */}
      <div className="h-8" />
    </>
  );
}
