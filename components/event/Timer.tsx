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

  const isUrgent = remaining > 0 && remaining < 2 * 60 * 1000;
  const isWarning = remaining > 0 && remaining < 10 * 60 * 1000;

  // Progress for circular indicator (0 to 1)
  const totalMs = totalMinutes ? totalMinutes * 60 * 1000 : undefined;
  const progress = totalMs ? Math.min(1, remaining / totalMs) : undefined;

  const color = isUrgent ? "#FF2D78" : isWarning ? "#FFB800" : "#F0F0FF";
  const glowColor = isUrgent ? "rgba(255,45,120,0.5)" : isWarning ? "rgba(255,184,0,0.3)" : "none";
  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "full") {
    // Full-screen countdown for the start screen
    const circumference = 2 * Math.PI * 52;
    const dashOffset = progress !== undefined ? circumference * (1 - progress) : 0;

    return (
      <div className="flex flex-col items-center gap-3">
        {/* Circular progress */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 120 120">
            {/* Track */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            {/* Progress */}
            {progress !== undefined && (
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transition: "stroke-dashoffset 1s linear, stroke 0.5s",
                  filter: isUrgent ? `drop-shadow(0 0 6px ${color})` : "none",
                }}
              />
            )}
          </svg>

          {/* Time display */}
          <div className="text-center z-10">
            <span
              className="font-mono font-black text-3xl tracking-wider block"
              style={{
                color,
                textShadow: isUrgent ? `0 0 20px ${glowColor}` : "none",
              }}
            >
              {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
            </span>
          </div>
        </div>

        {/* Status label */}
        {isUrgent && remaining > 0 && (
          <span
            className="text-xs font-bold px-3 py-1 rounded-full animate-pulse"
            style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}
          >
            ¡Últimos minutos!
          </span>
        )}
        {isWarning && !isUrgent && (
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "rgba(255,184,0,0.12)", color: "#FFB800" }}
          >
            ¡Apúrate!
          </span>
        )}
      </div>
    );
  }

  // Compact variant — inline in header
  return (
    <div className="flex items-center gap-2">
      {/* Mini circular indicator */}
      {progress !== undefined && (
        <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
          <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <circle
            cx="12" cy="12" r="10" fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 10}
            strokeDashoffset={2 * Math.PI * 10 * (1 - (progress ?? 0))}
            style={{
              transition: "stroke-dashoffset 1s linear, stroke 0.5s",
              filter: isUrgent ? `drop-shadow(0 0 3px ${color})` : "none",
            }}
          />
        </svg>
      )}

      <span
        className="font-mono font-bold text-sm tracking-widest"
        style={{
          color,
          textShadow: isUrgent ? `0 0 8px ${glowColor}` : "none",
        }}
      >
        {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
      </span>

      {isWarning && !isUrgent && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(255,184,0,0.12)", color: "#FFB800" }}>
          !
        </span>
      )}
      {isUrgent && remaining > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse"
          style={{ background: "rgba(255,45,120,0.15)", color: "#FF2D78" }}>
          !!
        </span>
      )}
    </div>
  );
}
