"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getRelationLabel } from "@/lib/utils/relationLabels";
import WindowGate from "@/components/event/WindowGate";

type LikeEntry = {
  id: string;
  type: string;
  created_at: string;
  from_user_id: string;
  from_user: { full_name: string; avatar_url: string | null };
  event: {
    registrations: {
      selfie_url: string;
      display_name?: string | null;
      table_number: string | null;
      relation_type: string | null;
      user_id: string;
    }[];
  };
};

type Match = {
  id: string;
  matched_at: string;
  other_user: { id: string; full_name: string; avatar_url: string | null };
  other_selfie: string | null;
  other_table: string | null;
  other_display_name: string | null;
  other_relation_type?: string | null;
};

type SubTab = "likes" | "matches";

export default function ConnectionsPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SubTab) || "likes";

  const [activeTab, setActiveTab] = useState<SubTab>(initialTab);
  const [likes, setLikes] = useState<LikeEntry[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState<string | null>(null);
  const [windowEnded, setWindowEnded] = useState(false);

  // Review gate
  const [hasReviewed, setHasReviewed] = useState<boolean | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewWouldUse, setReviewWouldUse] = useState<boolean | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/events/${eventId}/likes?direction=received`).then((r) => r.json()),
      fetch(`/api/v1/events/${eventId}/matches`).then((r) => r.json()),
      fetch(`/api/v1/events/${eventId}/reviews`).then((r) => r.json()),
      fetch(`/api/v1/events/${eventId}/window-status`).then((r) => r.json()),
    ]).then(([likesData, matchesData, reviewData, windowData]) => {
      setLikes(likesData.likes ?? []);
      setMatches(matchesData.matches ?? []);
      setHasReviewed(reviewData.reviewed ?? false);
      setWindowEnded(windowData.window_status === "ended");
      setLoading(false);
    });
  }, [eventId]);

  async function handleMatch(fromUserId: string) {
    setMatching(fromUserId);
    if (navigator.vibrate) navigator.vibrate(20);
    const res = await fetch(`/api/v1/events/${eventId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ with_user_id: fromUserId }),
    });
    if (res.ok) {
      setActiveTab("matches");
      const updated = await fetch(`/api/v1/events/${eventId}/matches`).then((r) => r.json());
      setMatches(updated.matches ?? []);
    }
    setMatching(null);
  }

  async function submitReview() {
    if (reviewRating === 0 || reviewWouldUse === null) return;
    setSubmittingReview(true);
    const res = await fetch(`/api/v1/events/${eventId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() || null, would_use_again: reviewWouldUse }),
    });
    if (res.ok) {
      setHasReviewed(true);
      setShowReviewPopup(false);
    }
    setSubmittingReview(false);
  }

  if (loading) {
    return (
      <div className="p-4 pt-6">
        <div className="h-7 w-40 rounded-lg mb-6 skeleton" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <WindowGate eventId={eventId} allowWhenEnded>
    <div className="p-4 pt-6 relative">
      <h1 className="text-2xl font-black mb-4" style={{ color: "#F0F0FF" }}>Conexiones</h1>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <button onClick={() => setActiveTab("likes")}
          className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: activeTab === "likes" ? "linear-gradient(135deg, #FF2D78, #7B2FBE)" : "transparent",
            color: activeTab === "likes" ? "#fff" : "#8585A8",
          }}>
          Ve a quien le gustas
          {likes.length > 0 && <span className="ml-1.5 opacity-80">({likes.length})</span>}
        </button>
        <button onClick={() => setActiveTab("matches")}
          className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: activeTab === "matches" ? "linear-gradient(135deg, #FF2D78, #7B2FBE)" : "transparent",
            color: activeTab === "matches" ? "#fff" : "#8585A8",
          }}>
          Tu match perfecto
          {matches.length > 0 && <span className="ml-1.5 opacity-80">({matches.length})</span>}
        </button>
      </div>

      {/* LIKES TAB */}
      {activeTab === "likes" && (
        <>
          {likes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: "rgba(255,45,120,0.08)" }}>
                <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: "#F0F0FF" }}>Sin likes todavia</p>
              <p className="text-xs" style={{ color: "#44445A" }}>Sigue haciendo swipe para recibir likes</p>
            </div>
          ) : (
            <div className="relative">
              <div className={`grid grid-cols-2 gap-3 ${!hasReviewed ? "pointer-events-none select-none" : ""}`}
                style={!hasReviewed ? { filter: "blur(16px)" } : undefined}>
                {likes.map((like, i) => {
                  const reg = like.event.registrations.find((r) => r.user_id === like.from_user_id);
                  const photo = reg?.selfie_url || like.from_user.avatar_url;
                  const isSuperLike = like.type === "super_like";
                  const displayName = reg?.display_name || like.from_user.full_name;
                  const firstName = displayName.split(" ")[0];

                  return (
                    <motion.div key={like.id}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="rounded-2xl overflow-hidden relative"
                      style={{ background: "#0F0F1A", border: isSuperLike ? "1px solid rgba(255,184,0,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="relative aspect-[3/4]">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={firstName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,45,120,0.05)" }}>
                            <svg width={40} height={40} fill="none" viewBox="0 0 24 24" stroke="#44445A" strokeWidth={1}>
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,15,0.9) 0%, rgba(7,7,15,0.2) 50%, transparent 100%)" }} />
                        {isSuperLike && (
                          <div className="absolute top-2 right-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(255,184,0,0.2)", border: "1px solid rgba(255,184,0,0.3)" }}>
                              <svg width={14} height={14} fill="#FFB800" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-bold text-sm truncate" style={{ color: "#F0F0FF" }}>{firstName}</p>
                          {!windowEnded && reg?.relation_type && (
                            <p className="text-[10px] truncate font-medium" style={{ color: "#8585A8" }}>
                              {getRelationLabel(reg.relation_type) ?? "Invitad@"}
                            </p>
                          )}
                        </div>
                      </div>
                      {!windowEnded ? (
                        <button onClick={() => handleMatch(like.from_user_id)}
                          disabled={matching === like.from_user_id}
                          className="w-full py-3 text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-1.5"
                          style={{
                            background: isSuperLike ? "linear-gradient(135deg, #FFB800, #FF8C00)" : "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                            color: "#fff",
                          }}>
                          {matching === like.from_user_id ? (
                            <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#fff", borderTopColor: "transparent" }} />
                          ) : (
                            <>
                              <svg width={14} height={14} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                              </svg>
                              Match
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="w-full py-2.5 text-[10px] font-medium text-center" style={{ color: "#44445A", background: "rgba(255,255,255,0.02)" }}>
                          Te dio like
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Review gate overlay */}
              {!hasReviewed && likes.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="rounded-2xl p-6 max-w-xs w-full text-center mx-4"
                    style={{ background: "rgba(15,15,26,0.95)", border: "1px solid rgba(255,45,120,0.2)", backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ background: "rgba(255,45,120,0.1)" }}>
                      <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                        <path d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 115.636 5.636a9 9 0 0113.728 0z" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h3 className="text-base font-black mb-1" style={{ color: "#F0F0FF" }}>Quieres ver quien te dio like?</h3>
                    <p className="text-xs mb-4" style={{ color: "#8585A8" }}>
                      Califica tu experiencia en N&apos;GAGE para desbloquear tus likes
                    </p>
                    <button onClick={() => setShowReviewPopup(true)}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-transform active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
                      Calificar ahora
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MATCHES TAB */}
      {activeTab === "matches" && (
        <>
          {matches.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: "rgba(255,45,120,0.08)" }}>
                <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: "#F0F0FF" }}>Aun no hay matches</p>
              <p className="text-xs" style={{ color: "#44445A" }}>Sigue haciendo swipe para encontrar tu match</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {matches.map((match, i) => {
                const photo = match.other_selfie || match.other_user.avatar_url;
                const displayed = match.other_display_name || match.other_user.full_name;
                const firstName = displayed.split(" ")[0];
                const teamLabel = getRelationLabel(match.other_relation_type);

                return (
                  <motion.div key={match.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="rounded-2xl overflow-hidden relative"
                    style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="aspect-[3/4] relative">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt={firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(255,45,120,0.06)" }}>
                          <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#FF2D78" strokeWidth={1.5}>
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{
                        background: "linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.3) 50%, transparent 100%)"
                      }} />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-black text-sm truncate" style={{ color: "#F0F0FF" }}>{firstName}</p>
                        {match.other_table && (
                          <p className="text-[10px] font-bold mt-0.5" style={{ color: "#FFB800" }}>Mesa {match.other_table}</p>
                        )}
                        {teamLabel && (
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: "#8585A8" }}>{teamLabel}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Review popup modal */}
      <AnimatePresence>
        {showReviewPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-lg font-black text-center mb-1" style={{ color: "#F0F0FF" }}>Califica N&apos;GAGE</h2>
              <p className="text-xs text-center mb-5" style={{ color: "#8585A8" }}>Tu opinion nos ayuda a mejorar</p>

              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)}
                    className="transition-transform active:scale-90">
                    <svg width={36} height={36} viewBox="0 0 24 24"
                      fill={star <= reviewRating ? "#FFB800" : "none"}
                      stroke={star <= reviewRating ? "#FFB800" : "#44445A"} strokeWidth={1.5}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>

              <textarea placeholder="Cuentanos tu experiencia... (opcional)" value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)} rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#F0F0FF" }} />

              <p className="text-xs font-bold mb-2" style={{ color: "#F0F0FF" }}>La volverias a usar?</p>
              <div className="flex gap-2 mb-5">
                <button onClick={() => setReviewWouldUse(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: reviewWouldUse === true ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                    border: reviewWouldUse === true ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    color: reviewWouldUse === true ? "#10B981" : "#8585A8",
                  }}>Si</button>
                <button onClick={() => setReviewWouldUse(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: reviewWouldUse === false ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)",
                    border: reviewWouldUse === false ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    color: reviewWouldUse === false ? "#EF4444" : "#8585A8",
                  }}>No</button>
              </div>

              <button onClick={submitReview}
                disabled={reviewRating === 0 || reviewWouldUse === null || submittingReview}
                className="w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-40 transition-transform active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF2D78, #7B2FBE)", color: "#fff" }}>
                {submittingReview ? "Enviando..." : "Enviar y ver mis likes"}
              </button>
              <button onClick={() => setShowReviewPopup(false)}
                className="w-full py-2 mt-2 text-xs font-medium" style={{ color: "#44445A" }}>Ahora no</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </WindowGate>
  );
}
