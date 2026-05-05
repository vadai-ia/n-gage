"use client";

import { motion } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";

/**
 * Mockup de iPhone con la pantalla de swipe de N'GAGE.
 * Todo SVG/divs, sin imágenes externas — sigue funcionando offline y carga al instante.
 */
export function PhoneMockup() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto"
      style={{ width: 280, maxWidth: "100%" }}
    >
      {/* Glow detrás del phone */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(255,45,120,0.45), transparent 60%), radial-gradient(circle at 70% 70%, rgba(26,110,255,0.35), transparent 60%)",
          transform: "scale(1.4)",
        }}
      />

      {/* Body del phone */}
      <div
        className="relative rounded-[44px] p-2.5"
        style={{
          background: "linear-gradient(160deg, #2A2A40 0%, #0F0F1A 100%)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
          aspectRatio: "9 / 19.5",
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 rounded-full z-20"
          style={{ background: "#000" }}
        />

        {/* Pantalla */}
        <div
          className="relative w-full h-full rounded-[36px] overflow-hidden"
          style={{ background: "#07070F" }}
        >
          {/* Header de evento */}
          <div className="px-4 pt-10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: "#10B981" }}>En vivo</span>
            </div>
            <span className="text-[10px] font-mono font-bold" style={{ color: "#FFB800" }}>23:47</span>
          </div>

          {/* Card stack */}
          <div className="relative h-[78%] mx-3">
            {/* Card detrás */}
            <div
              className="absolute inset-x-3 top-2 bottom-12 rounded-3xl"
              style={{ background: "#161625", transform: "scale(0.94) translateY(8px)", opacity: 0.5 }}
            />
            {/* Card principal */}
            <motion.div
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 top-0 bottom-12 rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* "Foto" */}
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.4), transparent 60%)",
                }}
              />
              {/* Overlay inferior */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/2"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}
              />
              {/* Texto del card */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles size={10} style={{ color: "#FFB800" }} />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest" style={{ color: "#FFB800" }}>Super like recibido</span>
                </div>
                <h3 className="font-display font-bold text-base text-white leading-tight">Camila, 26</h3>
                <p className="text-[10px] text-white/85 leading-tight mt-0.5">Mesa 12 · Aquí esta noche</p>
              </div>
            </motion.div>

            {/* Botones */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 pb-1">
              <button
                aria-hidden
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <X size={16} className="text-white/70" />
              </button>
              <motion.button
                aria-hidden
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", boxShadow: "0 0 20px rgba(255,45,120,0.6)" }}
              >
                <Heart size={20} className="text-white" fill="#fff" />
              </motion.button>
              <button
                aria-hidden
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FFB800, #FF6B00)", boxShadow: "0 0 16px rgba(255,184,0,0.5)" }}
              >
                <Sparkles size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Bottom nav simulada */}
          <div className="absolute bottom-2 left-3 right-3 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
        </div>
      </div>
    </motion.div>
  );
}
