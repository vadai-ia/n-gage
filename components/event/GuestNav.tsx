"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useNotifications } from "@/lib/contexts/NotificationContext";

const TABS = [
  {
    key: "profile",
    label: "Perfil",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: "connections",
    label: "Matches",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    key: "camera",
    label: "",
    isCamera: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    icon: (_active: boolean) => (
      <svg width={26} height={26} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    key: "search",
    label: "Swipe",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "promo",
    label: "Promo",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

export default function GuestNav() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { counts, resetLikes, resetMatches, resetMessages } = useNotifications();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-md mx-auto relative">
        {TABS.map((tab) => {
          const href = `/event/${id}/${tab.key}`;
          const active = pathname === href || pathname?.startsWith(href + "/");

          let badgeCount = 0;
          if (tab.key === "connections") badgeCount = counts.likes + counts.matches + counts.messages;

          const handleClick = () => {
            if (tab.key === "connections") { resetLikes(); resetMatches(); resetMessages(); }
          };

          if (tab.isCamera) {
            return (
              <Link key={tab.key} href={href}
                className="flex items-center justify-center -mt-6 relative z-50 transition-transform active:scale-95">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #1A1A1A, #0A0A0A)",
                    border: "1px solid rgba(255,45,120,0.4)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.6), 0 0 20px rgba(255,45,120,0.2)",
                    color: "#F0F0FF",
                  }}>
                  {tab.icon(active)}
                </div>
              </Link>
            );
          }

          return (
            <Link key={tab.key} href={href} onClick={handleClick}
              className="flex flex-col items-center gap-1 py-2 px-1 relative w-14">
              <span style={{ color: active ? "#F0F0FF" : "#44445A", transition: "color 0.3s ease" }}>
                {tab.icon(active)}
              </span>
              {badgeCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "#FF2D78", color: "#fff", boxShadow: "0 0 8px rgba(255,45,120,0.6)" }}>
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
              <span className="text-[8px] font-body tracking-wider uppercase"
                style={{ color: active ? "#F0F0FF" : "#44445A", transition: "color 0.3s ease" }}>
                {tab.label}
              </span>
              {active && (
                <motion.div layoutId="activeTabIndicator"
                  className="absolute -bottom-2 left-1/2 w-1 h-1 rounded-full bg-[#FF2D78]"
                  initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ x: "-50%", boxShadow: "0 0 10px rgba(255,45,120,0.8)" }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
