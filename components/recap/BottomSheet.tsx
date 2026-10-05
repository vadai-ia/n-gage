"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function BottomSheet({ open, onClose, title, children }: Props) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 cursor-default"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="relative w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-t-3xl md:rounded-3xl outline-none backdrop-blur-xl"
            style={{
              background: "rgba(15,15,26,0.96)",
              border: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
            }}
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag={reduceMotion ? false : "y"}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onClose(); }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 pt-3 pb-2 touch-none"
              style={{ background: "rgba(15,15,26,0.96)" }}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full md:hidden" style={{ background: "rgba(255,255,255,0.2)" }} aria-hidden />
              <h2 className="font-display text-lg font-bold pt-3" style={{ color: "var(--text-primary)" }}>{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="mt-2 flex h-11 w-11 items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                style={{ color: "var(--fg-2)" }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
