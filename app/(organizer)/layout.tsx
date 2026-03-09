"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/dashboard", label: "Mis Eventos", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )},
  { href: "/events/new", label: "Crear Evento", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )},
];

type UserRole = "admin" | "organizer" | "host" | "guest";

const ROLE_ROUTES: Record<UserRole, { label: string; href: string }> = {
  admin:     { label: "Super Admin",  href: "/admin" },
  organizer: { label: "Organizador",  href: "/dashboard" },
  host:      { label: "Host",         href: "/dashboard" },
  guest:     { label: "Invitado",     href: "/dashboard" },
};

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showRoles, setShowRoles] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === "SUPER_ADMIN") {
        setIsSuperAdmin(true);
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const availableRoles: UserRole[] = isSuperAdmin
    ? ["admin", "organizer"]
    : ["organizer"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07070F" }}>
      {/* Sticky header */}
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-50"
        style={{
          background: "rgba(7,7,15,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <span
            className="text-lg font-bold"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "var(--font-playfair)",
            }}
          >
            N&apos;GAGE
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "rgba(255,45,120,0.12)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.2)" }}
          >
            Organizador
          </span>

          {availableRoles.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowRoles((v) => !v)}
                className="text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ color: "#8585A8", background: showRoles ? "rgba(255,255,255,0.06)" : "transparent" }}
              >
                Cambiar vista
              </button>
              {showRoles && (
                <div
                  className="absolute right-0 top-8 w-44 rounded-xl p-2 shadow-xl z-50"
                  style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setShowRoles(false);
                        router.push(ROLE_ROUTES[role].href);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        color: role === "organizer" ? "#FF2D78" : "#F0F0FF",
                        background: role === "organizer" ? "rgba(255,45,120,0.08)" : "transparent",
                      }}
                    >
                      {ROLE_ROUTES[role].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="text-xs px-2 py-1 rounded-lg transition-colors"
            style={{ color: "#8585A8" }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around py-3 px-2 z-40"
        style={{
          background: "rgba(15,15,26,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all"
              style={{ color: active ? "#FF2D78" : "#8585A8" }}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
