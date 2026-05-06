"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, X, ArrowRight, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { LandingUserContext } from "@/lib/landing/get-user-context";
import { useVariant } from "./VariantProvider";
import { VariantSwitcher } from "./VariantSwitcher";

const NAV_LINKS = [
  { href: "#como-funciona",   label: "Cómo funciona" },
  { href: "#casos-de-uso",    label: "Casos de uso" },
  { href: "#para-tu-evento",  label: "Para tu evento" },
  { href: "/precios",         label: "Precios" },
  { href: "#contacto",        label: "Contacto" },
];

export function Navbar({ user }: { user: LandingUserContext }) {
  const { variant, content } = useVariant();
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

  const isWeddings = variant === "weddings";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? isWeddings
            ? "rgba(250,250,246,0.78)"
            : "var(--v-card-strong)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid var(--v-line)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 h-16 lg:h-20 gap-4">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="N'GAGE inicio">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110"
            style={{
              background: "var(--v-gradient)",
              color: isWeddings ? "#fff" : "#fff",
              boxShadow: "0 0 20px rgba(var(--v-accent-rgb), 0.35)",
            }}
          >
            N
          </div>
          <span
            className="font-display font-bold text-lg tracking-tight whitespace-nowrap"
            style={{ color: "var(--v-fg)" }}
          >
            N&apos;GAGE
            {content.sub && (
              <span
                className="font-mono ml-1.5"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: "var(--v-fg-3)",
                  fontWeight: 600,
                }}
              >
                {content.sub}
              </span>
            )}
          </span>
        </Link>

        {/* Variant switcher (desktop) — pill segmentado */}
        <div className="hidden lg:flex flex-1 justify-center">
          <VariantSwitcher />
        </div>

        {/* Inline links (desktop, después del switcher si hay espacio) */}
        <nav className="hidden xl:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium transition-colors rounded-lg"
              style={{ color: "var(--v-fg-3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--v-fg)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v-fg-3)")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user.isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all"
                style={{
                  background: "var(--v-bg-2)",
                  border: "1px solid var(--v-line-2)",
                }}
                aria-label="Menú de usuario"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "var(--v-gradient)", color: "#fff" }}
                  >
                    {initials || <User size={14} />}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  style={{ color: "var(--v-fg-3)" }}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--v-card-strong)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid var(--v-line-2)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                    }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--v-line)" }}>
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--v-fg)" }}>
                        {user.fullName ?? "Sin nombre"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--v-fg-3)" }}>{user.email}</p>
                    </div>
                    <Link
                      href={user.dashboardUrl}
                      className="flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors"
                      style={{ color: "var(--v-fg)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--v-bg-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      onClick={() => setOpen(false)}
                    >
                      Ir a mi panel <ArrowRight size={16} style={{ color: "var(--v-accent)" }} />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors text-left"
                      style={{ color: "var(--v-fg-3)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--v-bg-2)")}
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
              style={{ color: "var(--v-fg)", border: "1px solid var(--v-line-2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v-bg-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Entrar
            </Link>
          )}

          <Link
            href="#contacto"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-full transition-all"
            style={{
              background: "var(--v-gradient)",
              color: "#fff",
              boxShadow: "0 0 20px rgba(var(--v-accent-rgb), 0.35)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {variant === "events" ? "Cuéntanos" : variant === "weddings" ? "Reservar fecha" : "Solicita demo"}
            <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 -mr-2"
            style={{ color: "var(--v-fg)" }}
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
            style={{
              background: isWeddings ? "rgba(250,250,246,0.85)" : "rgba(7,7,15,0.85)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm flex flex-col"
              style={{
                background: "var(--v-card-strong)",
                borderLeft: "1px solid var(--v-line)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: "1px solid var(--v-line)" }}
              >
                <span className="font-display font-bold" style={{ color: "var(--v-fg)" }}>Menú</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Cerrar">
                  <X size={22} style={{ color: "var(--v-fg-3)" }} />
                </button>
              </div>

              {/* Variant switcher mobile */}
              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--v-line)" }}>
                <div className="flex justify-center">
                  <VariantSwitcher />
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium"
                    style={{ color: "var(--v-fg)" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="p-5 space-y-3" style={{ borderTop: "1px solid var(--v-line)" }}>
                {user.isLoggedIn ? (
                  <>
                    <Link
                      href={user.dashboardUrl}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-sm"
                      style={{ background: "var(--v-gradient)", color: "#fff" }}
                    >
                      Ir a mi panel <ArrowRight size={14} />
                    </Link>
                    <button
                      onClick={async () => { await handleLogout(); setMenuOpen(false); }}
                      className="w-full py-3 rounded-full font-medium text-sm"
                      style={{ color: "var(--v-fg-3)", border: "1px solid var(--v-line-2)" }}
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
                      style={{ background: "var(--v-gradient)", color: "#fff" }}
                    >
                      Solicita una demo <ArrowRight size={14} />
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center w-full py-3 rounded-full font-semibold text-sm"
                      style={{ color: "var(--v-fg)", border: "1px solid var(--v-line-2)" }}
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
