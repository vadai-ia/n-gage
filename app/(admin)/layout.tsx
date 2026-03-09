"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ViewSwitcher from "@/components/admin/ViewSwitcher";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/events", label: "Eventos", icon: "calendar" },
  { href: "/admin/users", label: "Usuarios", icon: "users" },
  { href: "/admin/reports", label: "Reportes", icon: "flag" },
];

function NavIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const s = size;
  if (icon === "grid")
    return (
      <svg width={s} height={s} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  if (icon === "calendar")
    return (
      <svg width={s} height={s} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  if (icon === "users")
    return (
      <svg width={s} height={s} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  if (icon === "flag")
    return (
      <svg width={s} height={s} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
      </svg>
    );
  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
          style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)" }}
        >
          N
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "#F0F0FF" }}>
            N&apos;GAGE
          </p>
          <p className="text-xs font-semibold" style={{ color: "#FF2D78" }}>
            Super Admin
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: active ? "rgba(255,45,120,0.12)" : "transparent",
                color: active ? "#FF2D78" : "#8585A8",
              }}
            >
              <NavIcon icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:brightness-125"
          style={{ color: "#8585A8" }}
        >
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Cerrar sesion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "#07070F", color: "#F0F0FF" }}>
      <ViewSwitcher />
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r fixed inset-y-0 left-0 z-30"
        style={{ background: "#0A0A14", borderColor: "rgba(255,255,255,0.06)" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-64 h-full flex flex-col border-r"
            style={{ background: "#0A0A14", borderColor: "rgba(255,255,255,0.06)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden lg:ml-64">
        {/* Mobile Header */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-20"
          style={{
            background: "rgba(7,7,15,0.92)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2" style={{ color: "#8585A8" }}>
            <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
              style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)" }}
            >
              N
            </div>
            <span className="font-bold text-sm">N&apos;GAGE</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
            >
              Admin
            </span>
          </div>
          <button onClick={handleLogout} className="p-2 -mr-2" style={{ color: "#8585A8" }}>
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </header>

        {/* Mobile Bottom Nav */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t py-2"
          style={{
            background: "rgba(10,10,20,0.97)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <span style={{ color: active ? "#FF2D78" : "#44445A" }}>
                  <NavIcon icon={item.icon} size={18} />
                </span>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: active ? "#FF2D78" : "#44445A" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
