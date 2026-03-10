"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const TABS = [
  {
    key: "search",
    label: "Buscar",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "likes",
    label: "Likes",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    key: "camera",
    label: "",
    isCamera: true,
    icon: (_active: boolean) => (
      <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    key: "matches",
    label: "Matches",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    key: "album",
    label: "Álbum",
    icon: (active: boolean) => (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
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
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{
        background: "rgba(7,7,15,0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1.5">
        {TABS.map((tab) => {
          const href = `/event/${id}/${tab.key}`;
          const active = pathname === href || pathname?.startsWith(href + "/");

          // Camera button — elevated, special design
          if (tab.isCamera) {
            return (
              <Link
                key={tab.key}
                href={href}
                className="flex items-center justify-center -mt-5 relative"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #FF2D78, #7B2FBE)"
                      : "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                    boxShadow: "0 4px 20px rgba(255,45,120,0.4)",
                    color: "#fff",
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
              className="flex flex-col items-center gap-0.5 py-1 px-3 transition-all active:scale-95"
            >
              <span
                style={{
                  color: active ? "#FF2D78" : "#44445A",
                  transition: "color 0.2s",
                }}
              >
                {tab.icon(active)}
              </span>
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{
                  color: active ? "#FF2D78" : "#44445A",
                  transition: "color 0.2s",
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
