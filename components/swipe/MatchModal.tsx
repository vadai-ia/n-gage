"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MatchModalProps {
  myPhoto: string;
  theirPhoto: string;
  theirName: string;
  matchId: string;
  onClose: () => void;
  onChat: () => void;
}

export default function MatchModal({ myPhoto, theirPhoto, theirName, onClose, onChat }: MatchModalProps) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (navigator.vibrate) navigator.vibrate([30, 10, 50]);

    // Confetti suave en colores de marca
    import("canvas-confetti").then(({ default: confetti }) => {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.55 },
          colors: ["#FF2D78", "#7B2FBE", "#1A6EFF", "#FFB800"],
          scalar: 0.9,
          gravity: 0.8,
        });
      }, 400);

      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#FF2D78", "#FFB800"],
          scalar: 0.7,
        });
      }, 700);
    });
  }, []);

  const firstName = theirName.split(" ")[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
        style={{
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Title (Editorial style) */}
        <motion.div
           // Slide up slowly instead of bouncy spring
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-center mb-10"
        >
          <h1
            className="text-5xl font-black tracking-tight mb-3"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #FFB800)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Match!
          </h1>
          <p className="font-body text-sm tracking-wide opacity-70" style={{ color: "#E0E0E0" }}>
            Tú y <strong>{firstName}</strong> han coincidido
          </p>
        </motion.div>

        {/* Photos collision (Cinematic overlap) */}
        <div className="flex items-center justify-center gap-0 mb-12 relative h-32">
          {/* My photo */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 20, opacity: 1 }} // Overlap
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-32 h-32 rounded-full overflow-hidden relative z-10"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <img src={myPhoto} alt="Yo" className="w-full h-full object-cover grayscale opacity-90 transition-all duration-1000 animate-in fade-in" style={{ filter: 'grayscale(30%)' }} />
          </motion.div>

          {/* Their photo */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: -20, opacity: 1 }} // Overlap
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-32 h-32 rounded-full overflow-hidden relative z-20"
            style={{
              border: "1px solid rgba(255,45,120,0.3)", // Subtle brand ring on their photo
              boxShadow: "0 10px 40px rgba(255,45,120,0.15)",
            }}
          >
            <img src={theirPhoto} alt={theirName} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Buttons (Minimalist) */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <button
            onClick={onChat}
            className="w-full py-4 rounded-full font-body font-medium text-sm tracking-wide transition-all active:scale-[0.98]"
            style={{
              background: "#F0F0FF",
              color: "#000000",
            }}
          >
            Ver mis matches
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-full font-body font-medium text-sm tracking-wide transition-all active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#F0F0FF",
            }}
          >
            Volver al evento
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
