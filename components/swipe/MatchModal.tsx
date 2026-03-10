"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

interface MatchModalProps {
  myPhoto: string;
  theirPhoto: string;
  theirName: string;
  matchId: string;
  onClose: () => void;
  onChat: () => void;
}

export default function MatchModal({ myPhoto, theirPhoto, theirName, onClose, onChat }: MatchModalProps) {
  const hasConfetti = useRef(false);

  useEffect(() => {
    if (hasConfetti.current) return;
    hasConfetti.current = true;

    // Haptic
    if (navigator.vibrate) navigator.vibrate([50, 30, 100]);

    // Confetti burst from both sides
    const colors = ["#FF2D78", "#7B2FBE", "#FFB800", "#1A6EFF", "#10B981"];

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.3, y: 0.5 },
        colors,
        startVelocity: 35,
        gravity: 0.8,
        ticks: 120,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.7, y: 0.5 },
        colors,
        startVelocity: 35,
        gravity: 0.8,
        ticks: 120,
        disableForReducedMotion: true,
      });
    }, 200);

    // Second burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors,
        startVelocity: 25,
        gravity: 1,
        ticks: 80,
        disableForReducedMotion: true,
      });
    }, 600);
  }, []);

  const firstName = theirName.split(" ")[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
        style={{
          background: "rgba(7,7,15,0.96)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1
            className="text-5xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE, #1A6EFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(255,45,120,0.3))",
            }}
          >
            ¡Match!
          </h1>
          <p className="text-sm" style={{ color: "#8585A8" }}>
            Tú y <strong style={{ color: "#F0F0FF" }}>{firstName}</strong> se gustaron
          </p>
        </motion.div>

        {/* Photos collision */}
        <div className="flex items-center justify-center gap-0 mb-10 relative">
          {/* My photo */}
          <motion.div
            initial={{ x: -120, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
            className="w-28 h-28 rounded-full overflow-hidden relative z-10 flex-shrink-0"
            style={{
              border: "3px solid #FF2D78",
              boxShadow: "0 0 40px rgba(255,45,120,0.4)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={myPhoto} alt="Yo" className="w-full h-full object-cover" />
          </motion.div>

          {/* Heart connector */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.5 }}
            className="relative z-20 -mx-4"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                boxShadow: "0 0 30px rgba(255,45,120,0.5)",
              }}
            >
              <svg width={20} height={20} fill="#fff" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
          </motion.div>

          {/* Their photo */}
          <motion.div
            initial={{ x: 120, opacity: 0, scale: 0.5 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
            className="w-28 h-28 rounded-full overflow-hidden relative z-10 flex-shrink-0"
            style={{
              border: "3px solid #7B2FBE",
              boxShadow: "0 0 40px rgba(123,47,190,0.4)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={theirPhoto} alt={theirName} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          <button
            onClick={onChat}
            className="w-full py-4 rounded-2xl font-bold text-base transition-transform active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
              color: "#fff",
              boxShadow: "0 8px 30px rgba(255,45,120,0.35)",
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Enviar mensaje
            </span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-transform active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#8585A8",
            }}
          >
            Seguir buscando
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
