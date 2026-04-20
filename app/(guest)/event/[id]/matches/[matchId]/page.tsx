"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "motion/react";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  sender: { full_name: string; avatar_url: string | null };
};

export default function ChatPage() {
  const { id: eventId, matchId } = useParams<{ id: string; matchId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [myUserId, setMyUserId] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherName, setOtherName] = useState("");
  const [otherPhoto, setOtherPhoto] = useState("");
  const [otherTable, setOtherTable] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setMyUserId(user.id);
      const res = await fetch(`/api/v1/matches/${matchId}/messages`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/matches`)
      .then((r) => r.json())
      .then((d) => {
        const match = (d.matches ?? []).find((m: { id: string; other_user: { full_name: string }; other_selfie: string | null; other_display_name: string | null; other_table: string | null }) => m.id === matchId);
        if (match) {
          setOtherName(match.other_display_name || match.other_user.full_name);
          setOtherPhoto(match.other_selfie || match.other_user.avatar_url || "");
          setOtherTable(match.other_table);
        }
      });
  }, [eventId, matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const sendMessage = useCallback(async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    if (navigator.vibrate) navigator.vibrate(10);
    const content = text.trim();
    setText("");

    const res = await fetch(`/api/v1/matches/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    }
    setSending(false);
  }, [text, sending, matchId]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  const firstName = otherName.split(" ")[0] || "Match";

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100dvh", background: "#07070F" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: "#07070F" }}>
      {/* Header — glassmorphism */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(7,7,15,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => router.push(`/event/${eventId}/matches`)}
          aria-label="Volver"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#8585A8" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: "2px solid rgba(255,45,120,0.3)" }}>
          {otherPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otherPhoto} alt={firstName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "rgba(255,45,120,0.08)" }}>
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: "#F0F0FF" }}>{firstName}</p>
          <span className="text-[10px] font-medium" style={{ color: "#8585A8" }}>
            {otherTable ? `Mesa ${otherTable}` : "En el evento"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
              style={{ background: "rgba(255,45,120,0.08)" }}>
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#F0F0FF" }}>
              Di hola a {firstName}
            </p>
            <p className="text-xs" style={{ color: "#44445A" }}>
              Hicieron match — el primer mensaje marca la diferencia
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === myUserId;
          const showTime = i === messages.length - 1 ||
            messages[i + 1]?.sender_id !== msg.sender_id ||
            new Date(messages[i + 1]?.created_at).getTime() - new Date(msg.created_at).getTime() > 120000;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%]">
                <div
                  className="px-4 py-2.5 text-sm leading-relaxed"
                  style={{
                    background: isMe
                      ? "linear-gradient(135deg, #FF2D78, #7B2FBE)"
                      : "rgba(255,255,255,0.04)",
                    color: isMe ? "#fff" : "#F0F0FF",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    border: isMe ? "none" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: isMe ? "0 2px 12px rgba(255,45,120,0.15)" : "none",
                  }}
                >
                  {msg.content}
                </div>
                {showTime && (
                  <p className={`text-[10px] mt-1 px-1 font-medium ${isMe ? "text-right" : "text-left"}`}
                    style={{ color: "#44445A" }}>
                    {formatTime(msg.created_at)}
                    {isMe && (
                      <span className="ml-1" style={{ color: msg.read_at ? "#1A6EFF" : "#44445A" }}>
                        {msg.read_at ? "✓✓" : "✓"}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input — glassmorphism */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-end gap-2.5"
        style={{
          background: "rgba(7,7,15,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe algo..."
          rows={1}
          className="flex-1 rounded-2xl px-4 py-2.5 text-sm resize-none outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#F0F0FF",
            maxHeight: "100px",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          aria-label="Enviar mensaje"
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-transform active:scale-90"
          style={{
            background: text.trim()
              ? "linear-gradient(135deg, #FF2D78, #7B2FBE)"
              : "rgba(255,255,255,0.05)",
            boxShadow: text.trim() ? "0 2px 12px rgba(255,45,120,0.3)" : "none",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
