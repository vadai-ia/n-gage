"use client";

import { useEffect, useState, useCallback } from "react";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  _count: { organized_events: number; registrations: number };
};

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "#FFB800",
  EVENT_ORGANIZER: "#7B2FBE",
  EVENT_HOST: "#1A6EFF",
  GUEST: "#8585A8",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  EVENT_ORGANIZER: "Organizador",
  EVENT_HOST: "Host",
  GUEST: "Invitado",
};

const ALL_ROLES = ["SUPER_ADMIN", "EVENT_ORGANIZER", "EVENT_HOST", "GUEST"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (role) params.set("role", role);
    if (query) params.set("q", query);
    fetch(`/api/v1/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? []);
        setTotal(d.total ?? 0);
        setPages(d.pages ?? 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, role, query]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  async function doAction(userId: string, action: string, newRole?: string) {
    setActing(userId + action);
    await fetch("/api/v1/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role: newRole }),
    });
    setActing(null);
    setRoleDropdown(null);
    load();
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: "#F0F0FF" }}>
        Usuarios
      </h1>
      <p className="text-sm mb-5" style={{ color: "#8585A8" }}>
        <span style={{ color: "#FFB800", fontWeight: 700 }}>{total}</span> usuarios en la plataforma
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar nombre o email..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "#0F0F1A",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#F0F0FF",
          }}
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
        >
          Buscar
        </button>
      </form>

      {/* Role Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["", ...ALL_ROLES].map((r) => (
          <button
            key={r}
            onClick={() => {
              setRole(r);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            style={{
              background: role === r ? "rgba(255,45,120,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${role === r ? "#FF2D78" : "rgba(255,255,255,0.06)"}`,
              color: role === r ? "#FF2D78" : "#8585A8",
            }}
          >
            {r === "" ? "Todos" : ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ background: "#0F0F1A" }}
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <svg
            width={48}
            height={48}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            className="mx-auto mb-4"
            style={{ color: "#44445A" }}
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <p style={{ color: "#8585A8" }}>No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl p-4"
              style={{
                background: "#0F0F1A",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* User row */}
              <button
                className="w-full text-left"
                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold overflow-hidden"
                      style={{
                        background: `${ROLE_COLOR[u.role]}20`,
                        color: ROLE_COLOR[u.role],
                      }}
                    >
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        u.full_name?.charAt(0)?.toUpperCase() ?? "?"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: "#F0F0FF" }}
                        >
                          {u.full_name}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={{
                            background: `${ROLE_COLOR[u.role]}22`,
                            color: ROLE_COLOR[u.role],
                          }}
                        >
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                        {!u.is_active && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
                          >
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "#8585A8" }}>
                        {u.email}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#44445A" }}>
                        {u._count.organized_events > 0 &&
                          `${u._count.organized_events} eventos organizados / `}
                        {u._count.registrations} registros /&nbsp;
                        {new Date(u.created_at).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <svg
                    width={16}
                    height={16}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="flex-shrink-0 transition-transform"
                    style={{
                      color: "#44445A",
                      transform: expanded === u.id ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              {/* Expanded Actions */}
              {expanded === u.id && (
                <div
                  className="mt-3 pt-3 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex gap-2 flex-wrap">
                    {/* Role change dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setRoleDropdown(roleDropdown === u.id ? null : u.id)
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                        style={{
                          background: "rgba(26,110,255,0.15)",
                          color: "#1A6EFF",
                        }}
                      >
                        Cambiar Rol
                        <svg
                          width={12}
                          height={12}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      {roleDropdown === u.id && (
                        <div
                          className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-10 min-w-[160px]"
                          style={{
                            background: "#16162a",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {ALL_ROLES.filter((r) => r !== u.role).map((r) => (
                            <button
                              key={r}
                              onClick={() => doAction(u.id, "change_role", r)}
                              className="w-full px-3 py-2 text-left text-xs font-semibold hover:brightness-125 block"
                              style={{ color: ROLE_COLOR[r] }}
                            >
                              {ROLE_LABEL[r]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {u.role !== "SUPER_ADMIN" && (
                      <>
                        {u.is_active ? (
                          <button
                            onClick={() => doAction(u.id, "suspend")}
                            disabled={acting === u.id + "suspend"}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              color: "#EF4444",
                            }}
                          >
                            {acting === u.id + "suspend"
                              ? "..."
                              : "Suspender"}
                          </button>
                        ) : (
                          <button
                            onClick={() => doAction(u.id, "activate")}
                            disabled={acting === u.id + "activate"}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: "rgba(16,185,129,0.15)",
                              color: "#10B981",
                            }}
                          >
                            {acting === u.id + "activate"
                              ? "..."
                              : "Activar"}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Seguro que quieres eliminar a ${u.full_name}?`
                              )
                            ) {
                              doAction(u.id, "delete");
                            }
                          }}
                          disabled={acting === u.id + "delete"}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            color: "#EF4444",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                        >
                          {acting === u.id + "delete" ? "..." : "Eliminar"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.06)",
              color: page === 1 ? "#44445A" : "#F0F0FF",
            }}
          >
            Anterior
          </button>
          <span className="text-sm" style={{ color: "#8585A8" }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.06)",
              color: page === pages ? "#44445A" : "#F0F0FF",
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
