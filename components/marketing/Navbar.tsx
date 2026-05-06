"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { LandingUserContext } from "@/lib/landing/get-user-context";
import { variantFromPath, VARIANT_PATHS, type Variant } from "@/lib/landing/variant";

const SWITCHER: { variant: Variant; label: string }[] = [
  { variant: "general", label: "N'GAGE" },
  { variant: "weddings", label: "/ WEDDINGS" },
  { variant: "events", label: "/ EVENTS" },
];

export function Navbar({ user }: { user: LandingUserContext }) {
  const pathname = usePathname();
  const active = variantFromPath(pathname);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const w = switcherRef.current;
      if (!w) return;
      const a = w.querySelector(".switcher-btn.active") as HTMLElement | null;
      if (a) setInd({ left: a.offsetLeft, width: a.offsetWidth });
    };
    update();
    const t = setTimeout(update, 80);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
    };
  }, [active]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
  }

  const initials = (user.fullName ?? "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Switcher (top-left) */}
      <div className="switcher-wrap">
        <nav className="switcher" ref={switcherRef} role="tablist" aria-label="Variante">
          <span className="switcher-indicator" style={{ left: ind.left, width: ind.width }} />
          {SWITCHER.map((v) => (
            <Link
              key={v.variant}
              href={VARIANT_PATHS[v.variant]}
              className={`switcher-btn ${active === v.variant ? "active" : ""}`}
              role="tab"
              aria-selected={active === v.variant}
            >
              {v.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Topnav (top-right) */}
      <div className="topnav">
        <Link href="/precios" className="topnav-link hide-mobile">Precios</Link>

        {user.isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="topnav-link"
              style={{ paddingLeft: 6 }}
              aria-label="Menú de usuario"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    background: "var(--gradient-hero)",
                    color: "#fff",
                  }}
                >
                  {initials || <User size={11} />}
                </span>
              )}
              <ChevronDown size={12} style={{ opacity: 0.7, transform: open ? "rotate(180deg)" : "" }} />
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: 8,
                  width: 240,
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "var(--bg-2)",
                  border: "1px solid var(--line-2)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", marginBottom: 2 }}>
                    {user.fullName ?? "Sin nombre"}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--fg-3)" }}>{user.email}</p>
                </div>
                <Link
                  href={user.dashboardUrl}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 14px",
                    fontSize: 14,
                    color: "var(--fg)",
                  }}
                >
                  Ir a mi panel →
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 14px",
                    fontSize: 14,
                    color: "var(--fg-3)",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="topnav-link hide-mobile">Entrar</Link>
        )}

        <Link href="#contacto" className="topnav-link cta">Demo</Link>
      </div>
    </>
  );
}
