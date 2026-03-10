"use client";

import { useEffect, useState, useCallback } from "react";

interface TimerProps {
  expiresAt: string;
  totalMinutes?: number;
  onExpire?: () => void;
  variant?: "full" | "compact";
}

export default function Timer({ expiresAt, totalMinutes, onExpire, variant = "compact" }: TimerProps) {
  const [remaining, setRemaining] = useState(0);

  const tick = useCallback(() => {
    const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    setRemaining(diff);
    if (diff === 0) onExpire?.();
  }, [expiresAt, onExpire]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Aesthetic thresholds (Silent Luxury)
  const isUrgent = remaining > 0 && remaining < 2 * 60 * 1000;
  const isWarning = remaining > 0 && remaining < 10 * 60 * 1000;

  // Progress for circular indicator (0 to 1)
  const totalMs = totalMinutes ? totalMinutes * 60 * 1000 : undefined;
  const progress = totalMs ? Math.min(1, remaining / totalMs) : undefined;

  // Elegant colors
  const color = isUrgent ? "#D6285A" : isWarning ? "#D4AF37" : "#E0E0E0";
  const glowColor = isUrgent ? "rgba(214,40,90,0.3)" : isWarning ? "rgba(212,175,55,0.2)" : "transparent";
  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "full") {
    // Full-screen countdown for the start screen
    const circumference = 2 * Math.PI * 52;
    const dashOffset = progress !== undefined ? circumference * (1 - progress) : 0;

    return (
      <div className="flex flex-col items-center gap-4">
        {/* Circular progress (Thin, Elegant Ring) */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 120 120">
            {/* Track */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
            {/* Progress */}
            {progress !== undefined && (
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transition: "stroke-dashoffset 1s linear, stroke 1s ease",
                  filter: `drop-shadow(0 0 10px ${glowColor})`,
                }}
              />
            )}
          </svg>

          {/* Time display */}
          <div className="text-center z-10">
            <span
              className="font-mono font-medium text-3xl tracking-widest block"
              style={{
                color,
                textShadow: `0 0 20px ${glowColor}`,
                transition: "color 1s ease",
              }}
            >
              {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
            </span>
          </div>
        </div>

        {/* Status label (Subtle fade, NO aggressive pulsing) */}
        <div className="h-6 flex items-center justify-center transition-opacity duration-1000" style={{ opacity: isWarning || isUrgent ? 1 : 0 }}>
             <span
                className="text-xs uppercase tracking-widest px-4 py-1.5 rounded-full"
                style={{
                    background: isUrgent ? "rgba(214,40,90,0.08)" : "rgba(212,175,55,0.08)",
                    border: `1px solid ${isUrgent ? "rgba(214,40,90,0.2)" : "rgba(212,175,55,0.2)"}`,
                    color: isUrgent ? "#D6285A" : "#D4AF37",
                }}
            >
                {isUrgent ? "Tiempo Final" : "Aprovecha el momento"}
            </span>
        </div>
      </div>
    );
  }

  // Compact variant — inline in header
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Mini circular indicator */}
      {progress !== undefined && (
        <svg width="16" height="16" viewBox="0 0 24 24" className="-rotate-90">
          <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
          <circle
            cx="12" cy="12" r="10" fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 10}
            strokeDashoffset={2 * Math.PI * 10 * (1 - (progress ?? 0))}
            style={{
              transition: "stroke-dashoffset 1s linear, stroke 1s ease",
            }}
          />
        </svg>
      )}

      <span
        className="font-mono font-medium text-xs tracking-widest"
        style={{
          color,
          transition: "color 1s ease",
        }}
      >
        {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
