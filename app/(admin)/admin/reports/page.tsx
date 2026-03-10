"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";

type Report = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  photo: { id: string; cloudinary_url: string; thumbnail_url: string | null; is_visible: boolean };
  reporter: { full_name: string; email: string };
};

/* ── SVG Icons ── */

function IconFlag({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IconShield({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconCheckCircle({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconTrash({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconX({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChevron({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconEye({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconInbox({ size = 48, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function IconUser({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconClock({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ── Filter config ── */

const FILTERS = [
  { key: "pending",   label: "Pendientes", color: "#FFB800" },
  { key: "resolved",  label: "Resueltos",  color: "#10B981" },
  { key: "dismissed", label: "Descartados", color: "#8585A8" },
  { key: "all",       label: "Todos",      color: "#1A6EFF" },
] as const;

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: "#FFB800", bg: "rgba(255,184,0,0.12)",  label: "Pendiente" },
  resolved:  { color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "Resuelto" },
  dismissed: { color: "#8585A8", bg: "rgba(133,133,168,0.10)", label: "Descartado" },
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("pending");
  const [acting,  setActing]  = useState<string | null>(null);
  const [preview, setPreview] = useState<Report | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/v1/admin/reports?status=${filter}`)
      .then((r) => r.json())
      .then((d) => { setReports(d.reports ?? []); setLoading(false); });
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function resolve(reportId: string, action: "dismiss" | "remove_photo") {
    setActing(reportId + action);
    await fetch("/api/v1/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action }),
    });
    setActing(null);
    setPreview(null);
    load();
  }

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  return (
    <div className="min-h-screen p-4 pb-8" style={{ background: "#07070F" }}>

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,45,120,0.12)" }}
          >
            <IconShield size={20} color="#FF2D78" />
          </div>
          <div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "#F0F0FF" }}
            >
              Reportes de Fotos
            </h1>
            <p
              className="text-xs"
              style={{ color: "#8585A8" }}
            >
              Modera contenido reportado por usuarios
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mb-5">
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-2"
          style={{ color: "#44445A" }}
        >
          Filtrar por estado
        </p>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
                style={{
                  background: isActive
                    ? `${f.color}1A`
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? `${f.color}40` : "rgba(255,255,255,0.04)"}`,
                  color: isActive ? f.color : "#8585A8",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Report count badge ── */}
      {!loading && reports.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "#44445A" }}
          >
            Resultados
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${activeFilter.color}1A`, color: activeFilter.color }}
          >
            {reports.length}
          </span>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton rounded-2xl"
              style={{ height: 88, background: "#0F0F1A" }}
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(16,185,129,0.08)" }}
          >
            <IconInbox size={36} color="#10B981" />
          </div>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "#F0F0FF" }}
          >
            Sin reportes
          </p>
          <p
            className="text-xs"
            style={{ color: "#8585A8" }}
          >
            No hay reportes en esta categoria
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((rep) => {
            const sc = STATUS_CONFIG[rep.status] ?? STATUS_CONFIG.pending;
            return (
              <button
                key={rep.id}
                onClick={() => setPreview(rep)}
                className="rounded-2xl p-3.5 flex items-center gap-3.5 text-left w-full transition-all duration-200 group"
                style={{
                  background: "#0F0F1A",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "#12121F";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.background = "#0F0F1A";
                }}
              >
                {/* Thumbnail */}
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rep.photo.thumbnail_url || rep.photo.cloudinary_url}
                    alt="Foto reportada"
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(4px) brightness(0.5)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconFlag size={16} color="rgba(255,255,255,0.4)" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold truncate mb-0.5"
                    style={{ color: "#F0F0FF" }}
                  >
                    {rep.reason}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <IconUser size={11} color="#8585A8" />
                    <p className="text-xs truncate" style={{ color: "#8585A8" }}>
                      {rep.reporter.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <IconClock size={11} color="#44445A" />
                    <p className="text-[11px]" style={{ color: "#44445A" }}>
                      {new Date(rep.created_at).toLocaleString("es-MX")}
                    </p>
                  </div>
                </div>

                {/* Chevron */}
                <div className="flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity">
                  <IconChevron size={18} color="#8585A8" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Modal detalle / accion ── */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{
            background: "rgba(7,7,15,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
          onClick={() => setPreview(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            {/* Close button */}
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setPreview(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <IconX size={16} color="#8585A8" />
              </button>
            </div>

            {/* Foto (blurred) */}
            <div
              className="rounded-2xl overflow-hidden mb-3 relative"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.photo.cloudinary_url}
                alt="Foto reportada"
                className="w-full object-cover"
                style={{
                  maxHeight: "38vh",
                  filter: "blur(12px) brightness(0.4)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,45,120,0.15)" }}
                >
                  <IconFlag size={24} color="#FF2D78" />
                </div>
              </div>
            </div>

            {/* Info card */}
            <div
              className="rounded-2xl p-4 mb-3"
              style={{
                background: "#0F0F1A",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: "#44445A" }}
              >
                Motivo del reporte
              </p>
              <p className="text-sm font-medium mb-3" style={{ color: "#F0F0FF" }}>
                {preview.reason}
              </p>

              <div
                className="h-px w-full mb-3"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />

              <div className="flex items-center gap-2 mb-2">
                <IconUser size={13} color="#8585A8" />
                <p className="text-xs" style={{ color: "#8585A8" }}>
                  {preview.reporter.full_name}
                </p>
              </div>
              <p className="text-[11px] ml-5 mb-2" style={{ color: "#44445A" }}>
                {preview.reporter.email}
              </p>

              <div className="flex items-center gap-2 mb-2">
                <IconClock size={13} color="#8585A8" />
                <p className="text-xs" style={{ color: "#8585A8" }}>
                  {new Date(preview.created_at).toLocaleString("es-MX")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {preview.photo.is_visible ? (
                  <>
                    <IconEye size={13} color="#10B981" />
                    <p className="text-xs font-medium" style={{ color: "#10B981" }}>
                      Foto visible
                    </p>
                  </>
                ) : (
                  <>
                    <IconEyeOff size={13} color="#44445A" />
                    <p className="text-xs font-medium" style={{ color: "#44445A" }}>
                      Foto ya oculta
                    </p>
                  </>
                )}
              </div>

              {/* Status badge */}
              {(() => {
                const sc = STATUS_CONFIG[preview.status] ?? STATUS_CONFIG.pending;
                return (
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            {preview.status === "pending" && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => resolve(preview.id, "remove_photo")}
                  disabled={!!acting}
                  className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#EF4444",
                    opacity: acting ? 0.5 : 1,
                  }}
                >
                  {acting ? (
                    <span className="text-xs">Procesando...</span>
                  ) : (
                    <>
                      <IconTrash size={15} color="#EF4444" />
                      <span>Eliminar foto</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => resolve(preview.id, "dismiss")}
                  disabled={!!acting}
                  className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: "rgba(16,185,129,0.10)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    color: "#10B981",
                    opacity: acting ? 0.5 : 1,
                  }}
                >
                  {acting ? (
                    <span className="text-xs">Procesando...</span>
                  ) : (
                    <>
                      <IconCheckCircle size={15} color="#10B981" />
                      <span>Descartar</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => setPreview(null)}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#8585A8",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
