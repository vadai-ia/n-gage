"use client";

interface PoweredByProps {
  variant?: "default" | "muted";
}

export default function PoweredBy({ variant = "default" }: PoweredByProps) {
  const baseColor = variant === "muted" ? "#44445A" : "#8585A8";
  const linkColor = variant === "muted" ? "#8585A8" : "#F0F0FF";

  return (
    <div
      className="w-full flex items-center justify-center py-4 mt-6 text-xs tracking-wide"
      style={{ color: baseColor }}
    >
      <span>Powered by</span>
      <a
        href="https://kibah.com.mx"
        target="_blank"
        rel="noopener noreferrer"
        className="mx-1.5 font-semibold hover:underline transition-opacity hover:opacity-80"
        style={{ color: linkColor }}
      >
        Kibah.com.mx
      </a>
      <span>and</span>
      <span
        className="ml-1.5 font-semibold"
        style={{ color: linkColor }}
      >
        Vadai
      </span>
    </div>
  );
}
