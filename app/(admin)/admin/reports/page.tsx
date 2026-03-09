"use client";

import { useEffect, useState, useCallback } from "react";

type Report = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  photo: { id: string; cloudinary_url: string; thumbnail_url: string | null; is_visible: boolean };
  reporter: { full_name: string; email: string };
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

  const STATUS_COLOR: Record<string, string> = {
    pending: "#F59E0B", resolved: "#10B981", dismissed: "#555",
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Reportes de Fotos</h1>
      <p className="text-sm mb-4" style={{ color: "#A0A0B0" }}>Modera contenido reportado por usuarios</p>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(["pending", "resolved", "dismissed", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize"
            style={{
              background: filter === f ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${filter === f ? "#F59E0B" : "rgba(255,255,255,0.08)"}`,
              color: filter === f ? "#F59E0B" : "#A0A0B0",
            }}>
            {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : f === "resolved" ? "Resueltos" : "Descartados"}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#16161F" }} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✅</div>
          <p style={{ color: "#A0A0B0" }}>No hay reportes en esta categoría</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((rep) => (
            <button key={rep.id} onClick={() => setPreview(rep)}
              className="rounded-2xl p-3 flex items-center gap-3 text-left w-full"
              style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rep.photo.thumbnail_url || rep.photo.cloudinary_url}
                  alt="Foto reportada"
                  className="w-full h-full object-cover"
                  style={{ filter: "blur(4px)" }}
                />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{ background: `${STATUS_COLOR[rep.status]}22`, color: STATUS_COLOR[rep.status] }}>
                    {rep.status}
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">{rep.reason}</p>
                <p className="text-xs" style={{ color: "#A0A0B0" }}>
                  Reportado por: {rep.reporter.full_name}
                </p>
                <p className="text-xs" style={{ color: "#555" }}>
                  {new Date(rep.created_at).toLocaleString("es-MX")}
                </p>
              </div>
              <span style={{ color: "#555" }}>›</span>
            </button>
          ))}
        </div>
      )}

      {/* Modal detalle / acción */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setPreview(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
            {/* Foto (desenfocada) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.photo.cloudinary_url} alt="Foto reportada"
              className="w-full rounded-2xl mb-3 object-cover"
              style={{ maxHeight: "40vh", filter: "blur(12px) brightness(0.6)" }} />

            <div className="rounded-xl p-4 mb-3"
              style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="font-bold text-sm mb-1">Motivo del reporte</p>
              <p className="text-sm" style={{ color: "#ccc" }}>{preview.reason}</p>
              <p className="text-xs mt-2" style={{ color: "#A0A0B0" }}>
                Por: {preview.reporter.full_name} ({preview.reporter.email})
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                {new Date(preview.created_at).toLocaleString("es-MX")}
              </p>
              <p className="text-xs mt-1" style={{ color: preview.photo.is_visible ? "#10B981" : "#555" }}>
                Foto: {preview.photo.is_visible ? "visible" : "ya oculta"}
              </p>
            </div>

            {preview.status === "pending" && (
              <div className="flex gap-2 mb-2">
                <button onClick={() => resolve(preview.id, "remove_photo")}
                  disabled={!!acting}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}>
                  {acting ? "..." : "🗑️ Eliminar foto"}
                </button>
                <button onClick={() => resolve(preview.id, "dismiss")}
                  disabled={!!acting}
                  className="flex-1 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                  {acting ? "..." : "✓ Descartar"}
                </button>
              </div>
            )}

            <button onClick={() => setPreview(null)}
              className="w-full py-3 rounded-xl text-sm"
              style={{ background: "rgba(255,255,255,0.05)", color: "#ccc" }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
