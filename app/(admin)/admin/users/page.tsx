"use client";

import { useEffect, useState, useCallback } from "react";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
  _count: { organized_events: number; registrations: number };
};

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "#F59E0B",
  EVENT_ORGANIZER: "#784BA0",
  EVENT_HOST: "#2B86C5",
  GUEST: "#A0A0B0",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  EVENT_ORGANIZER: "Organizador",
  EVENT_HOST: "Host",
  GUEST: "Invitado",
};

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [role,    setRole]    = useState("");
  const [search,  setSearch]  = useState("");
  const [query,   setQuery]   = useState("");
  const [acting,  setActing]  = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (role)  params.set("role", role);
    if (query) params.set("q", query);
    fetch(`/api/v1/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setTotal(d.total ?? 0); setPages(d.pages ?? 1); setLoading(false); });
  }, [page, role, query]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  async function doAction(userId: string, action: string) {
    setActing(userId + action);
    await fetch("/api/v1/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    setActing(null);
    load();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-1">Usuarios</h1>
      <p className="text-sm mb-4" style={{ color: "#A0A0B0" }}>
        <span style={{ color: "#F59E0B", fontWeight: 700 }}>{total}</span> usuarios en la plataforma
      </p>

      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar nombre o email..."
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}
        />
        <button type="submit" className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>
          Buscar
        </button>
      </form>

      {/* Filtros rol */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "SUPER_ADMIN", "EVENT_ORGANIZER", "EVENT_HOST", "GUEST"].map((r) => (
          <button key={r} onClick={() => { setRole(r); setPage(1); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: role === r ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${role === r ? "#F59E0B" : "rgba(255,255,255,0.08)"}`,
              color: role === r ? "#F59E0B" : "#A0A0B0",
            }}>
            {r === "" ? "Todos" : ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#16161F" }} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👥</div>
          <p style={{ color: "#A0A0B0" }}>No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="rounded-2xl p-4"
              style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm truncate">{u.full_name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${ROLE_COLOR[u.role]}22`, color: ROLE_COLOR[u.role] }}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "#A0A0B0" }}>{u.email}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                    {u._count.organized_events > 0 && `${u._count.organized_events} eventos · `}
                    {u._count.registrations} registros ·{" "}
                    {new Date(u.created_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>

              {/* Acciones (solo para no-admins) */}
              {u.role !== "SUPER_ADMIN" && (
                <div className="flex gap-2 mt-3">
                  {u.role === "GUEST" && (
                    <button onClick={() => doAction(u.id, "make_organizer")}
                      disabled={acting === u.id + "make_organizer"}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-1"
                      style={{ background: "rgba(120,75,160,0.2)", color: "#c48dff" }}>
                      {acting === u.id + "make_organizer" ? "..." : "Hacer Organizador"}
                    </button>
                  )}
                  <button onClick={() => doAction(u.id, "suspend")}
                    disabled={acting === u.id + "suspend"}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                    {acting === u.id + "suspend" ? "..." : "Suspender"}
                  </button>
                  <button onClick={() => doAction(u.id, "activate")}
                    disabled={acting === u.id + "activate"}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                    {acting === u.id + "activate" ? "..." : "Activar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm" style={{ background: "#16161F", color: page === 1 ? "#555" : "#ccc" }}>
            ← Ant.
          </button>
          <span className="px-4 py-2 text-sm" style={{ color: "#A0A0B0" }}>{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm" style={{ background: "#16161F", color: page === pages ? "#555" : "#ccc" }}>
            Sig. →
          </button>
        </div>
      )}
    </div>
  );
}
