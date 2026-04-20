"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { useNotifications } from "@/lib/contexts/NotificationContext";

type Toast = {
  id: string;
  type: "like" | "match" | "message";
  text: string;
  href: string;
};

export default function RealtimeNotifications({ eventId }: { eventId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { incrementLikes, incrementMatches, incrementMessages } = useNotifications();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId || !eventId) return;
    const supabase = createClient();

    const pushToast = (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    };

    // Likes recibidos
    const likesChannel = supabase
      .channel(`evt-likes-${eventId}-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "event_likes",
        filter: `to_user_id=eq.${userId}`,
      }, (payload) => {
        const row = payload.new as { event_id: string; type: string };
        if (row.event_id !== eventId) return;
        if (pathname?.includes("/likes")) return;
        incrementLikes();
        if (navigator.vibrate) navigator.vibrate(15);
        pushToast({
          type: "like",
          text: row.type === "super_like" ? "Alguien te dio super like!" : "Alguien te dio like",
          href: `/event/${eventId}/likes`,
        });
      })
      .subscribe();

    // Matches nuevos
    const matchesChannel = supabase
      .channel(`evt-matches-${eventId}-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "event_matches",
        filter: `event_id=eq.${eventId}`,
      }, (payload) => {
        const row = payload.new as { user_a_id: string; user_b_id: string };
        if (row.user_a_id !== userId && row.user_b_id !== userId) return;
        incrementMatches();
        if (navigator.vibrate) navigator.vibrate([30, 10, 50]);
        pushToast({
          type: "match",
          text: "Nuevo match!",
          href: `/event/${eventId}/matches`,
        });
      })
      .subscribe();

    // Mensajes nuevos
    const msgChannel = supabase
      .channel(`evt-msgs-${eventId}-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "match_messages",
      }, (payload) => {
        const row = payload.new as { match_id: string; sender_id: string };
        if (row.sender_id === userId) return;
        if (pathname?.includes(`/matches/${row.match_id}`)) return;
        incrementMessages();
        pushToast({
          type: "message",
          text: "Nuevo mensaje",
          href: `/event/${eventId}/matches`,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [userId, eventId, pathname, incrementLikes, incrementMatches, incrementMessages]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => router.push(t.href)}
            className="pointer-events-auto px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 max-w-[90vw]"
            style={{
              background: "rgba(15,15,26,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: t.type === "match"
                ? "1px solid rgba(255,184,0,0.4)"
                : "1px solid rgba(255,45,120,0.3)",
              color: "#F0F0FF",
              boxShadow: t.type === "match"
                ? "0 8px 32px rgba(255,184,0,0.25)"
                : "0 8px 32px rgba(255,45,120,0.2)",
            }}
          >
            <span>{t.text}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
