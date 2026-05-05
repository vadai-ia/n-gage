"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, X, ArrowRight, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { LandingUserContext } from "@/lib/landing/get-user-context";

const NAV_LINKS = [
  { href: "#como-funciona",   label: "Cómo funciona" },
  { href: "#casos-de-uso",    label: "Casos de uso" },
  { href: "#para-tu-evento",  label: "Para tu evento" },
  { href: "/precios",         label: "Precios" },
  { href: "#contacto",        label: "Contacto" },
];

export function Navbar({ user }: { user: LandingUserContext }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const root = document.querySelector(".app-root") as HTMLElement | null;
      const top = root?.scrollTop ?? window.scrollY;
      setScrolled(top > 80);
    };
    const root = document.querySelector(".app-root") as HTMLElement | null;
    (root ?? window).addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => (root ?? window).removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(7,7,15,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 h-16 lg:h-20">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="N'GAGE inicio">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110"
            style={{ background: "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)", boxShadow: "0 0 20px rgba(255,45,120,0.35)" }}
          >
            N
          </div>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: "#F0F0FF" }}>
            N&apos;GAGE
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium transition-colors rounded-lg"
              style={{ color: "#8585A8" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F0FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8585A8")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user.isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                aria-label="Menú de usuario"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}
                  >
                    {initials || <User size={14} />}
                  </span>
                )}
                <ChevronDown size={14} style={{ color: "#8585A8" }} className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden"
                    style={{ background: "rgba(15,15,26,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <p className="text-sm font-semibold truncate" style={{ color: "#F0F0FF" }}>{user.fullName ?? "Sin nombre"}</p>
                      <p className="text-xs truncate" style={{ color: "#8585A8" }}>{user.email}</p>
                    </div>
                    <Link
                      href={user.dashboardUrl}
                      className="flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors"
                      style={{ color: "#F0F0FF" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => setOpen(false)}
                    >
                      Ir a mi panel <ArrowRight size={16} style={{ color: "#FF2D78" }} />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors text-left"
                      style={{ color: "#8585A8" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold rounded-full transition-all"
              style={{ color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              Entrar
            </Link>
          )}

          <Link
            href="#contacto"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-full transition-all"
            style={{ background: "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)", color: "#fff", boxShadow: "0 0 20px rgba(255,45,120,0.35)" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Solicita demo <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 -mr-2"
            style={{ color: "#F0F0FF" }}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
            style={{ background: "rgba(7,7,15,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm flex flex-col"
              style={{ background: "rgba(15,15,26,0.98)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="font-display font-bold" style={{ color: "#F0F0FF" }}>Menú</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Cerrar"><X size={22} style={{ color: "#8585A8" }} /></button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium"
                    style={{ color: "#F0F0FF" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="p-5 space-y-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {user.isLoggedIn ? (
                  <>
                    <Link
                      href={user.dashboardUrl}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-sm"
                      style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)", color: "#fff" }}
                    >
                      Ir a mi panel <ArrowRight size={14} />
                    </Link>
                    <button
                      onClick={async () => { await handleLogout(); setMenuOpen(false); }}
                      className="w-full py-3 rounded-full font-medium text-sm"
                      style={{ color: "#8585A8", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="#contacto"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-sm"
                      style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)", color: "#fff" }}
                    >
                      Solicita una demo <ArrowRight size={14} />
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center w-full py-3 rounded-full font-semibold text-sm"
                      style={{ color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      Entrar
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
