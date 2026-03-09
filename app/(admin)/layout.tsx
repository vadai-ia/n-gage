"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin",         icon: "📊", label: "Inicio" },
  { href: "/admin/events",  icon: "🎉", label: "Eventos" },
  { href: "/admin/users",   icon: "👥", label: "Usuarios" },
  { href: "/admin/reports", icon: "🚨", label: "Reportes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0F" }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50"
        style={{
          background: "rgba(10,10,15,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold gradient-text" style={{ fontFamily: "var(--font-playfair)" }}>
            N&apos;GAGE
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
            Super Admin
          </span>
        </div>
        <button onClick={handleLogout} className="text-xs" style={{ color: "#A0A0B0" }}>
          Salir
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-2 px-2"
        style={{
          background: "rgba(22,22,31,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
        {NAV.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all"
              style={{ color: active ? "#F59E0B" : "#A0A0B0" }}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
