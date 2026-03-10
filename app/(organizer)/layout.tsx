"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/dashboard", label: "Mis Eventos", icon: (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )},
  { href: "/events/new", label: "Nuevo Evento", icon: (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
    </svg>
  )},
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === "SUPER_ADMIN") setIsSuperAdmin(true);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07070F" }}>
      {/* Header — glassmorphism */}
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-50"
        style={{
          background: "rgba(7,7,15,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>N</div>
          <span className="font-black text-sm tracking-tight" style={{
            background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>N&apos;GAGE</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{ background: "rgba(255,45,120,0.08)", color: "#FF2D78", border: "1px solid rgba(255,45,120,0.1)" }}>
            Organizador
          </span>

          {isSuperAdmin && (
            <button
              onClick={() => router.push("/admin")}
              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition-all active:scale-95"
              style={{ background: "rgba(123,47,190,0.08)", color: "#7B2FBE", border: "1px solid rgba(123,47,190,0.1)" }}
            >
              Admin
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={1.8}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom nav — glassmorphism */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around py-2.5 px-2 z-40"
        style={{
          background: "rgba(7,7,15,0.9)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isDashActive = item.href === "/dashboard" && (pathname === "/dashboard" || pathname.startsWith("/events/"));
          const isActive = active || isDashActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-6 py-1 transition-all active:scale-95"
            >
              <span style={{ color: isActive ? "#FF2D78" : "#44445A" }}>{item.icon}</span>
              <span className="text-[10px] font-semibold" style={{ color: isActive ? "#FF2D78" : "#44445A" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
