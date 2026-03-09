"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

  const [messages, setMessages]   = useState<Message[]>([]);
  const [myUserId, setMyUserId]   = useState("");
  const [text, setText]           = useState("");
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [otherName, setOtherName] = useState("");
  const [otherPhoto, setOtherPhoto] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes y usuario actual
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

  // Cargar info del match (nombre del otro)
  useEffect(() => {
    fetch(`/api/v1/events/${eventId}/matches`)
      .then((r) => r.json())
      .then((d) => {
        const match = (d.matches ?? []).find((m: { id: string; other_user: { full_name: string }; other_selfie: string | null }) => m.id === matchId);
        if (match) {
          setOtherName(match.other_user.full_name);
          setOtherPhoto(match.other_selfie || match.other_user.avatar_url || "");
        }
      });
  }, [eventId, matchId]);

  // Scroll al fondo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime — escuchar nuevos mensajes
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
        <div className="text-3xl animate-pulse">💬</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "100dvh", background: "#0A0A0F" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: "rgba(22,22,31,0.97)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={() => router.push(`/event/${eventId}/matches`)} aria-label="Volver"
          style={{ color: "#A0A0B0", fontSize: "20px" }}>←</button>

        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: "2px solid #FF3CAC" }}>
          {otherPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "rgba(255,60,172,0.1)", fontSize: "18px" }}>👤</div>
          )}
        </div>

        <div className="flex-1">
          <p className="font-bold text-sm">{otherName || "Match"}</p>
          <p className="text-xs" style={{ color: "#FF3CAC" }}>● Conectado/a</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((msg) => {
          const isMe = msg.sender_id === myUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%]">
                <div className="px-4 py-2.5 rounded-2xl text-sm"
                  style={{
                    background: isMe
                      ? "linear-gradient(135deg, #FF3CAC, #784BA0)"
                      : "#16161F",
                    color: "#fff",
                    borderBottomRightRadius: isMe ? "4px" : "16px",
                    borderBottomLeftRadius: isMe ? "16px" : "4px",
                    border: isMe ? "none" : "1px solid rgba(255,255,255,0.07)",
                  }}>
                  {msg.content}
                </div>
                <p className={`text-xs mt-1 ${isMe ? "text-right" : "text-left"}`}
                  style={{ color: "#555" }}>
                  {formatTime(msg.created_at)}
                  {isMe && (
                    <span className="ml-1">{msg.read_at ? " ✓✓" : " ✓"}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 flex items-end gap-2"
        style={{ background: "rgba(22,22,31,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe algo..."
          rows={1}
          className="flex-1 rounded-2xl px-4 py-2.5 text-sm resize-none outline-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            maxHeight: "100px",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          aria-label="Enviar mensaje"
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
