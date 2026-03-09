"use client";

import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const params   = useParams<{ eventId: string }>();
  const eventId  = params?.eventId ?? "";

  const tabs = [
    { href: `/host/${eventId}`,        icon: "🎉", label: "Mi Evento" },
    { href: `/host/${eventId}/album`,  icon: "📸", label: "Álbum"    },
    { href: `/host/${eventId}/matches`,icon: "💑", label: "Matches"  },
    { href: `/host/${eventId}/stats`,  icon: "📊", label: "Stats"    },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col pb-20" style={{ background: "#0A0A0F" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50"
        style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-lg font-bold gradient-text" style={{ fontFamily: "var(--font-playfair)" }}>
          N&apos;GAGE
        </span>
        <span className="text-xs px-2 py-1 rounded-full"
          style={{ background: "rgba(120,75,160,0.2)", color: "#c48dff" }}>
          Anfitrión
        </span>
        <button onClick={handleLogout} className="text-xs" style={{ color: "#A0A0B0" }}>Salir</button>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-2 px-1"
        style={{ background: "rgba(22,22,31,0.97)", backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
              style={{ color: active ? "#c48dff" : "#A0A0B0" }}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
