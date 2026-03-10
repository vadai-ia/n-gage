"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  {
    key: "search",
    label: "Descubrir",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        {/* Changed to a more editorial 'feed' or 'list' look rather than a generic magnifying glass, or keep simple */}
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "likes",
    label: "Conexiones",
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
    key: "matches",
    label: "Mensajes",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    key: "album",
    label: "Galería",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
];

export default function GuestNav() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{
        background: "rgba(10,10,10,0.85)", // Darker, less transparent base
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-end justify-between px-4 pt-2 pb-2 max-w-md mx-auto relative">
        {TABS.map((tab) => {
          const href = `/event/${id}/${tab.key}`;
          const active = pathname === href || pathname?.startsWith(href + "/");

          if (tab.isCamera) {
            return (
              <Link
                key={tab.key}
                href={href}
                className="flex items-center justify-center -mt-6 relative z-50 transition-transform active:scale-95"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #1A1A1A, #0A0A0A)",
                    border: "1px solid rgba(214,40,90,0.4)", // Brand ring
                    boxShadow: "0 8px 30px rgba(0,0,0,0.6), 0 0 20px rgba(214,40,90,0.2)",
                    color: "#FAFAFA",
                  }}
                >
                  {tab.icon(active)}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.key}
              href={href}
              className="flex flex-col items-center gap-1.5 py-2 px-1 relative w-16"
            >
              <span
                style={{
                  color: active ? "#FAFAFA" : "#555555",
                  transition: "color 0.3s ease",
                }}
              >
                {tab.icon(active)}
              </span>
              <span
                className="text-[9px] font-body tracking-widest uppercase"
                style={{
                  color: active ? "#FAFAFA" : "#555555",
                  transition: "color 0.3s ease",
                }}
              >
                {tab.label}
              </span>

              {/* Animated underline for active state (Framer Motion) */}
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-2 left-1/2 w-1 h-1 rounded-full bg-[#D6285A]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ x: "-50%", boxShadow: "0 0 10px rgba(214,40,90,0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
