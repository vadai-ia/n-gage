"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import type { RecapPhoto } from "@/lib/recap/types";
import { recapImage } from "@/lib/recap/images";
import { formatTime } from "@/lib/recap/format";

type Props = {
  photos: RecapPhoto[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

export default function PhotoLightbox({ photos, index, onIndexChange }: Props) {
  const photo = index !== null ? photos[index] : undefined;
  const close = useCallback(() => onIndexChange(null), [onIndexChange]);
  const go = useCallback((delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + photos.length) % photos.length);
  }, [index, photos.length, onIndexChange]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, go]);

  const swipe = useSwipeable({
    onSwipedLeft: () => go(1),
    onSwipedRight: () => go(-1),
    onSwipedDown: close,
    preventScrollOnSwipe: true,
  });

  const iconButton = "flex h-11 w-11 items-center justify-center rounded-full cursor-pointer backdrop-blur-xl transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]";
  const iconStyle = { background: "rgba(15,15,26,0.7)", border: "1px solid rgba(255,255,255,0.12)", color: "#F0F0FF" };

  return (
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${index + 1} de ${photos.length}`}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(0,0,0,0.95)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex items-center justify-between gap-3 px-4" style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
            <div className="min-w-0 py-2">
              <p className="truncate text-sm font-semibold" style={{ color: "#F0F0FF" }}>{photo.byName ? `Por ${photo.byName}` : "Foto del evento"}</p>
              <p className="font-mono text-xs" style={{ color: "#8585A8" }}>{formatTime(photo.at)} · {index + 1}/{photos.length}</p>
            </div>
            <div className="flex gap-2">
              <a href={recapImage.download(photo.url)} download aria-label="Descargar foto" className={iconButton} style={iconStyle}>
                <Download size={18} aria-hidden />
              </a>
              <button type="button" onClick={close} aria-label="Cerrar" className={iconButton} style={iconStyle} autoFocus>
                <X size={20} aria-hidden />
              </button>
            </div>
          </div>

          <div {...swipe} className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-4">
            <AnimatePresence mode="wait" initial={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={photo.id}
                src={recapImage.large(photo.url)}
                alt={photo.byName ? `Foto tomada por ${photo.byName}` : "Foto del evento"}
                className="max-h-full max-w-full rounded-2xl object-contain"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                draggable={false}
              />
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className={`${iconButton} absolute left-3 top-1/2 -translate-y-1/2`} style={iconStyle}>
                  <ChevronLeft size={22} aria-hidden />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className={`${iconButton} absolute right-3 top-1/2 -translate-y-1/2`} style={iconStyle}>
                  <ChevronRight size={22} aria-hidden />
                </button>
              </>
            )}
          </div>
          <div style={{ height: "max(env(safe-area-inset-bottom), 12px)" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
