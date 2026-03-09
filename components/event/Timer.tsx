"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  expiresAt: string;
  onExpire?: () => void;
}

export default function Timer({ expiresAt, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(diff);
      if (diff === 0) onExpire?.();
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isUrgent  = remaining < 2 * 60 * 1000;
  const isWarning = remaining < 10 * 60 * 1000;

  const color = isUrgent ? "#FF3CAC" : isWarning ? "#F59E0B" : "#ffffff";

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm" style={{ color: "#A0A0B0" }}>⏱</span>
      <span
        className="font-mono font-bold text-lg tracking-widest"
        style={{
          color,
          textShadow: isUrgent ? `0 0 12px ${color}` : "none",
          animation: isUrgent ? "pulse 1s infinite" : "none",
        }}
      >
        {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
      </span>
      {isWarning && !isUrgent && (
        <span className="text-xs px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
          ¡Apúrate!
        </span>
      )}
      {isUrgent && remaining > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-full animate-pulse"
          style={{ background: "rgba(255,60,172,0.2)", color: "#FF3CAC" }}>
          ¡Últimos minutos!
        </span>
      )}
    </div>
  );
}
