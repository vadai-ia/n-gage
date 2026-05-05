"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STORAGE_KEY = "ngage_cookie_consent_v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const t = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function decide(value: "accept-all" | "essential") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: new Date().toISOString() }));
    } catch {}
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-40 left-3 right-3 lg:left-auto lg:right-5 lg:bottom-5 lg:max-w-md"
          style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
          role="dialog"
          aria-label="Aviso de cookies"
        >
          <div
            className="rounded-2xl p-4 lg:p-5"
            style={{
              background: "rgba(15,15,26,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#F0F0FF" }}>
              Usamos cookies para entender cómo navegas y mejorar tu experiencia.{" "}
              <Link href="/privacidad#cookies" className="underline" style={{ color: "#FF2D78" }}>
                Más detalles
              </Link>
              .
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => decide("essential")}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Solo esenciales
              </button>
              <button
                onClick={() => decide("accept-all")}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)", color: "#fff" }}
              >
                Aceptar todo
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
