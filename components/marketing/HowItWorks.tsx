"use client";

import { motion } from "framer-motion";
import { QrCode, Camera, Heart } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    icon: QrCode,
    title: "Escanea",
    body: "Apunta tu cámara al código. Sin descargas, sin apps. Tu pase entra solo.",
    color: "#FF2D78",
  },
  {
    n: "02",
    icon: Camera,
    title: "Tu selfie del momento",
    body: "Así te reconocen los demás. Sin filtros, sin galería — solo tú, en tu mejor noche.",
    color: "#7B2FBE",
  },
  {
    n: "03",
    icon: Heart,
    title: "Recorre y elige",
    body: "Descubre quién anda por aquí. Da like a quien te llame la atención, o un super like donde de verdad importe. Si el sentimiento es mutuo, te avisamos al instante.",
    color: "#1A6EFF",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <p className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase mb-5" style={{ color: "#FFB800" }}>
            Cómo funciona
          </p>
          <h2 className="font-display font-bold leading-tight mb-5" style={{ fontSize: "clamp(1.85rem, 4.5vw, 3.5rem)", color: "#F0F0FF" }}>
            Tan simple que parece <span className="gradient-text italic">magia</span>.
          </h2>
          <p className="text-base lg:text-lg" style={{ color: "#8585A8" }}>
            En menos de 60 segundos, cualquier invitado está adentro y conectando.
          </p>
        </Reveal>

        {/* Línea conectora desktop */}
        <div className="relative">
          <div
            aria-hidden
            className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, #FF2D78 20%, #7B2FBE 50%, #1A6EFF 80%, transparent)" }}
          />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 relative">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.n} delay={i * 0.15}>
                  <div className="text-center group">
                    <div className="relative inline-block mb-6">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -3 }}
                        transition={{ duration: 0.3 }}
                        className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center relative z-10"
                        style={{
                          background: `linear-gradient(135deg, ${step.color}25, ${step.color}05)`,
                          border: `1px solid ${step.color}40`,
                          boxShadow: `0 0 40px ${step.color}30`,
                        }}
                      >
                        <Icon size={36} style={{ color: step.color }} strokeWidth={1.5} />
                      </motion.div>
                      <span
                        className="absolute -top-2 -right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs"
                        style={{ background: "#07070F", border: `1px solid ${step.color}60`, color: step.color }}
                      >
                        {step.n}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-2xl mb-3" style={{ color: "#F0F0FF" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm lg:text-base leading-relaxed max-w-sm mx-auto" style={{ color: "#8585A8" }}>
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={0.3} className="text-center mt-16">
          <p className="font-display italic text-lg lg:text-xl" style={{ color: "#F0F0FF" }}>
            Lo que pase después, <span className="gradient-text font-bold">ya es entre ustedes.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
