"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const WA_NUMBER = "5215555555555"; // TODO: confirmar número real
const WA_TEXT = encodeURIComponent("Hola, me interesa saber más de N'GAGE para mi evento.");

export function WhatsAppFloat() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <motion.a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`}
      target="_blank"
      rel="noopener"
      aria-label="Contactar por WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="fixed z-40 group"
      style={{
        bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        right: 20,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full animate-ping"
        style={{ background: "rgba(16,185,129,0.4)" }}
      />
      <span
        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #25D366, #128C7E)",
          boxShadow: "0 8px 30px rgba(16,185,129,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden>
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
        </svg>
      </span>
      <span
        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{
          background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
          color: "#fff",
          boxShadow: "0 0 8px rgba(255,45,120,0.6)",
        }}
      >
        1
      </span>
    </motion.a>
  );
}
