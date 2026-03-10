"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ViewSwitcher from "@/components/admin/ViewSwitcher";

const TAB_ICONS = {
  event: (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  album: (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  matches: (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  stats: (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const params   = useParams<{ eventId: string }>();
  const eventId  = params?.eventId ?? "";

  const tabs = [
    { href: `/host/${eventId}`,        icon: TAB_ICONS.event,   label: "Mi Evento" },
    { href: `/host/${eventId}/album`,  icon: TAB_ICONS.album,   label: "Álbum"     },
    { href: `/host/${eventId}/matches`,icon: TAB_ICONS.matches, label: "Matches"   },
    { href: `/host/${eventId}/stats`,  icon: TAB_ICONS.stats,   label: "Stats"     },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07070F" }}>
      <ViewSwitcher />

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
        <Link href={`/host/${eventId}`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>N</div>
          <span className="font-black text-sm tracking-tight" style={{
            background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>N&apos;GAGE</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{ background: "rgba(123,47,190,0.08)", color: "#7B2FBE", border: "1px solid rgba(123,47,190,0.1)" }}>
            Anfitrión
          </span>

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
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 transition-all active:scale-95"
            >
              <span style={{ color: active ? "#7B2FBE" : "#44445A" }}>{tab.icon}</span>
              <span className="text-[10px] font-semibold" style={{ color: active ? "#7B2FBE" : "#44445A" }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
