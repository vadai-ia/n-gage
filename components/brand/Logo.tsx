"use client";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`flame-${size}`} x1="128" y1="64" x2="384" y2="448" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF2D78"/>
            <stop offset="50%" stopColor="#7B2FBE"/>
            <stop offset="100%" stopColor="#1A6EFF"/>
          </linearGradient>
        </defs>
        <path d="M256 480C256 480 64 320 64 200C64 120 128 64 200 64C230 64 256 80 256 80C256 80 248 48 280 24C312 48 304 80 304 80C350 50 400 80 430 120C460 160 448 220 448 220C448 320 256 480 256 480Z" fill={`url(#flame-${size})`}/>
        <path d="M256 400C256 400 176 310 176 240C176 200 210 180 240 190C252 194 256 210 256 210C256 210 260 194 272 190C302 180 336 200 336 240C336 310 256 400 256 400Z" fill="#07070F"/>
      </svg>
      {showText && (
        <span
          className="font-black tracking-tight"
          style={{
            fontSize: size * 0.65,
            background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          N&apos;GAGE
        </span>
      )}
    </div>
  );
}
