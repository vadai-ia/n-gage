"use client";

interface MatchModalProps {
  myPhoto: string;
  theirPhoto: string;
  theirName: string;
  matchId: string;
  onClose: () => void;
  onChat: () => void;
}

export default function MatchModal({ myPhoto, theirPhoto, theirName, onClose, onChat }: MatchModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)" }}>

      {/* Confeti decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["#FF3CAC","#784BA0","#2B86C5","#F59E0B","#4ade80"].map((c, i) => (
          Array.from({ length: 6 }).map((_, j) => (
            <div key={`${i}-${j}`} className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                background: c,
                left: `${(i * 20 + j * 7) % 100}%`,
                top: `${(j * 15 + i * 13) % 60}%`,
                animationDelay: `${(i + j) * 0.1}s`,
                opacity: 0.7,
              }} />
          ))
        ))}
      </div>

      <h1 className="text-4xl font-black mb-2 gradient-text" style={{ fontFamily: "var(--font-playfair)" }}>
        ¡Match!
      </h1>
      <p className="text-center mb-8" style={{ color: "#A0A0B0" }}>
        Tú y <strong style={{ color: "#fff" }}>{theirName}</strong> se gustaron mutuamente 🎉
      </p>

      {/* Fotos */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className="w-32 h-32 rounded-full overflow-hidden"
          style={{ border: "3px solid #FF3CAC", boxShadow: "0 0 30px rgba(255,60,172,0.5)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={myPhoto} alt="Yo" className="w-full h-full object-cover" />
        </div>
        <div className="text-3xl animate-pulse">💗</div>
        <div className="w-32 h-32 rounded-full overflow-hidden"
          style={{ border: "3px solid #784BA0", boxShadow: "0 0 30px rgba(120,75,160,0.5)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={theirPhoto} alt={theirName} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button onClick={onChat}
          className="w-full py-4 rounded-2xl font-bold text-lg"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)", color: "#fff",
            boxShadow: "0 8px 30px rgba(255,60,172,0.4)" }}>
          💬 Empezar a chatear
        </button>
        <button onClick={onClose}
          className="w-full py-3 rounded-2xl font-semibold text-sm"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A0A0B0" }}>
          Seguir buscando
        </button>
      </div>
    </div>
  );
}
