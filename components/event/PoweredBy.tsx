"use client";

interface PoweredByProps {
  variant?: "default" | "muted";
}

export default function PoweredBy({ variant = "default" }: PoweredByProps) {
  const color = variant === "muted" ? "#44445A" : "#8585A8";
  const brandColor = variant === "muted" ? "#8585A8" : "#F0F0FF";

  return (
    <div
      className="w-full flex items-center justify-center py-3 mt-4 gap-1.5"
      style={{ color }}
    >
      <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Powered by</span>
      <a
        href="https://vadai.com.mx"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] font-black tracking-[0.2em] uppercase hover:underline transition-opacity hover:opacity-80"
        style={{ color: brandColor }}
      >
        VADAI
      </a>
    </div>
  );
}
