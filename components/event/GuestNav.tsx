"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function GuestNav() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();

  const tabs = [
    { href: `/event/${id}/search`,  icon: "🔍", label: "Buscar"  },
    { href: `/event/${id}/likes`,   icon: "❤️", label: "Likes"   },
    { href: `/event/${id}/matches`, icon: "💬", label: "Matches" },
    { href: `/event/${id}/camera`,  icon: "📷", label: "Cámara"  },
    { href: `/event/${id}/profile`, icon: "👤", label: "Perfil"  },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-2 px-1"
      style={{ background: "rgba(22,22,31,0.97)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
            style={{ color: active ? "#FF3CAC" : "#A0A0B0" }}>
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
