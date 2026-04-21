"use client";

export const dynamic = "force-dynamic";

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
  _count: { organized_events: number; registrations: number; likes_received?: number; likes_sent?: number; matches?: number; matches_a?: number; matches_b?: number; photos?: number };
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
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ color: "#8585A8" }}
        >
          Gestion
        </p>
        <h1
          className="text-3xl lg:text-4xl font-black tracking-tight mb-2"
          style={{ color: "#F0F0FF" }}
        >
          Usuarios
        </h1>
        <p className="text-sm" style={{ color: "#8585A8" }}>
          <span style={{ color: "#FFB800", fontWeight: 700 }}>{total}</span>{" "}
          usuarios registrados en la plataforma
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <svg
            width={16}
            height={16}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#44445A" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#F0F0FF",
              // @ts-expect-error CSS custom properties
              "--tw-ring-color": "rgba(255,45,120,0.3)",
            }}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110"
          style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
        >
          Buscar
        </button>
      </form>

      {/* Role Filters */}
      <div className="mb-6">
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-2.5"
          style={{ color: "#44445A" }}
        >
          Filtrar por rol
        </p>
        <div className="flex gap-2 flex-wrap">
          {["", ...ALL_ROLES].map((r) => {
            const isActive = role === r;
            return (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setPage(1);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  background: isActive
                    ? "rgba(255,45,120,0.15)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${
                    isActive ? "rgba(255,45,120,0.3)" : "rgba(255,255,255,0.04)"
                  }`,
                  color: isActive ? "#FF2D78" : "#8585A8",
                }}
              >
                {r === "" ? "Todos" : ROLE_LABEL[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton rounded-2xl"
              style={{
                height: 88,
                background: "#0F0F1A",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div
          className="rounded-2xl text-center py-20"
          style={{
            background: "#0F0F1A",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <svg
              width={28}
              height={28}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "#44445A" }}
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <p className="text-sm font-bold mb-1" style={{ color: "#8585A8" }}>
            Sin resultados
          </p>
          <p className="text-xs" style={{ color: "#44445A" }}>
            No se encontraron usuarios con estos filtros
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl transition-all"
              style={{
                background: "#0F0F1A",
                border: `1px solid ${
                  expanded === u.id
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.04)"
                }`,
              }}
            >
              {/* User row */}
              <button
                className="w-full text-left p-4"
                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Avatar */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold overflow-hidden"
                      style={{
                        background: `${ROLE_COLOR[u.role]}15`,
                        color: ROLE_COLOR[u.role],
                        border: `1px solid ${ROLE_COLOR[u.role]}20`,
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p
                          className="font-bold text-sm truncate"
                          style={{ color: "#F0F0FF" }}
                        >
                          {u.full_name}
                        </p>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0"
                          style={{
                            background: `${ROLE_COLOR[u.role]}15`,
                            color: ROLE_COLOR[u.role],
                            border: `1px solid ${ROLE_COLOR[u.role]}20`,
                          }}
                        >
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                        {!u.is_active && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            style={{
                              background: "rgba(239,68,68,0.12)",
                              color: "#EF4444",
                              border: "1px solid rgba(239,68,68,0.2)",
                            }}
                          >
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs truncate mb-0.5"
                        style={{ color: "#8585A8" }}
                      >
                        {u.email}
                      </p>
                      <p className="text-[11px] flex items-center gap-2 flex-wrap" style={{ color: "#44445A" }}>
                        {u._count.organized_events > 0 && (
                          <span style={{ color: "#7B2FBE" }}>{u._count.organized_events} org</span>
                        )}
                        <span style={{ color: "#1A6EFF" }}>{u._count.registrations} eventos</span>
                        {(u._count.likes_received ?? 0) > 0 && (
                          <span style={{ color: "#FF2D78" }}>{u._count.likes_received} likes</span>
                        )}
                        {((u._count.matches ?? 0) > 0) && (
                          <span style={{ color: "#10B981" }}>{u._count.matches} matches</span>
                        )}
                        <span>&middot; {new Date(u.created_at).toLocaleDateString("es-MX")}</span>
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <svg
                      width={14}
                      height={14}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      className="transition-transform duration-200"
                      style={{
                        color: "#44445A",
                        transform:
                          expanded === u.id
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded Actions */}
              {expanded === u.id && (
                <div
                  className="mx-4 mb-4 pt-3"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* View detail link */}
                  <a href={`/admin/users/${u.id}`}
                    className="w-full mb-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:brightness-125"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
                    Ver perfil completo
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" />
                    </svg>
                  </a>

                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-2.5"
                    style={{ color: "#44445A" }}
                  >
                    Acciones
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {/* Role change dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setRoleDropdown(
                            roleDropdown === u.id ? null : u.id
                          )
                        }
                        className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:brightness-125"
                        style={{
                          background: "rgba(26,110,255,0.12)",
                          color: "#1A6EFF",
                          border: "1px solid rgba(26,110,255,0.15)",
                        }}
                      >
                        Cambiar Rol
                        <svg
                          width={12}
                          height={12}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          className="transition-transform duration-200"
                          style={{
                            transform:
                              roleDropdown === u.id
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      {roleDropdown === u.id && (
                        <div
                          className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-10 min-w-[180px]"
                          style={{
                            background: "rgba(22,22,42,0.85)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow:
                              "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset",
                          }}
                        >
                          {ALL_ROLES.filter((r) => r !== u.role).map(
                            (r, idx, arr) => (
                              <button
                                key={r}
                                onClick={() =>
                                  doAction(u.id, "change_role", r)
                                }
                                className="w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2.5 transition-all hover:brightness-125"
                                style={{
                                  color: ROLE_COLOR[r],
                                  borderBottom:
                                    idx < arr.length - 1
                                      ? "1px solid rgba(255,255,255,0.04)"
                                      : "none",
                                }}
                              >
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ background: ROLE_COLOR[r] }}
                                />
                                {ROLE_LABEL[r]}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {u.role !== "SUPER_ADMIN" && (
                      <>
                        {u.is_active ? (
                          <button
                            onClick={() => doAction(u.id, "suspend")}
                            disabled={acting === u.id + "suspend"}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-125 disabled:opacity-50"
                            style={{
                              background: "rgba(239,68,68,0.12)",
                              color: "#EF4444",
                              border: "1px solid rgba(239,68,68,0.15)",
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
                            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-125 disabled:opacity-50"
                            style={{
                              background: "rgba(16,185,129,0.12)",
                              color: "#10B981",
                              border: "1px solid rgba(16,185,129,0.15)",
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
                                `¿ELIMINAR a ${u.full_name} de forma permanente?\n\nEsto borrará su cuenta, sus eventos, registros, matches, fotos y cualquier otro dato. No se puede deshacer. El correo quedará libre para volver a registrarse.`
                              )
                            ) {
                              doAction(u.id, "delete");
                            }
                          }}
                          disabled={acting === u.id + "delete"}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-125 disabled:opacity-50"
                          style={{
                            background: "rgba(239,68,68,0.06)",
                            color: "#EF4444",
                            border: "1px solid rgba(239,68,68,0.15)",
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
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.04)",
              color: page === 1 ? "#44445A" : "#F0F0FF",
            }}
          >
            Anterior
          </button>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{
              color: "#8585A8",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30"
            style={{
              background: "#0F0F1A",
              border: "1px solid rgba(255,255,255,0.04)",
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
