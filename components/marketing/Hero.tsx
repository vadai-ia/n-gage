"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ParticleField } from "./ParticleField";
import { PhoneMockup } from "./PhoneMockup";

const TITLE_WORDS = ["Conecta.", "Aquí", "y", "ahora."];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12 lg:pb-16">
      {/* Fondo: partículas */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <ParticleField density={45} />
      </div>

      {/* Spotlight gradient detrás del título */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(255,45,120,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(26,110,255,0.18), transparent 60%)",
        }}
      />

      {/* Grid noise sutil */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full px-5 lg:px-8 grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
        {/* Copy */}
        <div className="lg:col-span-7 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 text-[11px] font-mono font-bold tracking-[0.2em] uppercase"
            style={{ color: "#FF2D78" }}
          >
            <span className="w-6 h-px" style={{ background: "#FF2D78" }} />
            Plataforma de conexión para eventos en vivo
          </motion.p>

          <h1
            className="font-display font-bold leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)", color: "#F0F0FF" }}
          >
            {TITLE_WORDS.map((word, i) => (
              <motion.span
                key={i}
                initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block mr-[0.25em]"
              >
                {i === 1 ? <span className="gradient-text">{word}</span> : word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-base lg:text-xl leading-relaxed mb-3 max-w-xl mx-auto lg:mx-0"
            style={{ color: "#8585A8" }}
          >
            N&apos;GAGE convierte cualquier evento en una experiencia de conexión real, efímera y memorable. Bodas, festivales, conciertos, corporativos, cruceros, graduaciones — donde haya gente reunida, hay magia por detonar.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="font-display italic text-sm lg:text-base mb-8 max-w-xl mx-auto lg:mx-0"
            style={{ color: "#F0F0FF" }}
          >
            <span className="gradient-text font-bold">No todo son looks, también son feels.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8"
          >
            <Link
              href="#contacto"
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-bold text-base transition-all"
              style={{
                background: "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)",
                color: "#fff",
                boxShadow: "0 0 30px rgba(255,45,120,0.4), 0 10px 40px rgba(123,47,190,0.3)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Solicita una demo gratis
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base transition-all"
              style={{ color: "#F0F0FF", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              Ver cómo funciona →
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-[11px] font-mono tracking-wider"
            style={{ color: "#44445A" }}
          >
            {/* TODO: confirmar números reales con Alejandro */}
            Eventos realizados · Conexiones generadas · Calificación de organizadores
          </motion.p>
        </div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center"
        >
          <PhoneMockup />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:block"
        style={{ color: "#44445A" }}
        aria-hidden
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
