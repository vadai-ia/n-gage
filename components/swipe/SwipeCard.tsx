"use client";

import { useState } from "react";
import TinderCard from "react-tinder-card";
import { motion, AnimatePresence } from "framer-motion";
import { GlassWater } from "lucide-react"; // Using this as a 'Cheers' icon for super like

export type Profile = {
  user_id: string;
  selfie_url: string;
  table_number: string | null;
  relation_type: string | null;
  interests: string[] | null;
  gender: string;
  super_like_used: boolean;
  compatibility_score?: number;
  shared_interests?: string[];
  user: { full_name: string; avatar_url: string | null };
};

const RELATION_LABELS: Record<string, string> = {
  friend_bride: "Amigo/a de la novia",
  friend_groom: "Amigo/a del novio",
  family_bride: "Familia de la novia",
  family_groom: "Familia del novio",
  coworker: "Compañero/a de trabajo",
  other: "Invitado/a",
};

interface SwipeCardProps {
  profile: Profile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike: () => void;
  superLikeAvailable: boolean;
  isTop: boolean;
  onSwipeRequirement?: (dir: string) => void;
}

export default function SwipeCard({
  profile,
  onLike,
  onDislike,
  onSuperLike,
  superLikeAvailable,
  isTop,
  onSwipeRequirement,
}: SwipeCardProps) {
  const [swipingDirection, setSwipingDirection] = useState<string | null>(null);

  const handleSwipe = (dir: string) => {
    if (dir === "right") onLike();
    else if (dir === "left") onDislike();
    else if (dir === "up" && superLikeAvailable) onSuperLike();
    
    if (onSwipeRequirement) onSwipeRequirement(dir);
  };

  const onCardLeftScreen = () => {
    // Cleanup if needed
  };

  const onSwipeRequirementFulfilled = (direction: string) => {
    setSwipingDirection(direction);
    // Haptic feedback if near threshold
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const onSwipeRequirementUnfulfilled = () => {
    setSwipingDirection(null);
  };

  const interests = Array.isArray(profile.interests) ? profile.interests.slice(0, 3) : [];
  const sharedInterests = profile.shared_interests ?? [];
  const firstName = profile.user.full_name.split(" ")[0];
  const isSoul = (profile.compatibility_score ?? 0) >= 40;

  // Visual cues based on swipe direction direction
  const isLiking = swipingDirection === "right";
  const isNoping = swipingDirection === "left";
  const isSuperLiking = swipingDirection === "up";

  return (
    <div className="absolute inset-0 pb-20"> {/* pb-20 leaves room for GuestNav */}
      <TinderCard
        className="absolute inset-0 flex items-center justify-center p-4 pb-8"
        onSwipe={handleSwipe}
        onCardLeftScreen={() => onCardLeftScreen()}
        onSwipeRequirementFulfilled={onSwipeRequirementFulfilled}
        onSwipeRequirementUnfulfilled={onSwipeRequirementUnfulfilled}
        preventSwipe={["down", ...(superLikeAvailable ? [] : ["up"])]}
        swipeRequirementType="position"
        swipeThreshold={120}
      >
        <motion.div
           // When not top card, subtle scale down and dim
          initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.8 }}
          animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full max-h-[85vh] rounded-[32px] overflow-hidden select-none"
          style={{
            boxShadow: isTop ? "0 20px 40px rgba(0,0,0,0.8)" : "none",
            border: "1px solid rgba(255,255,255,0.05)",
            background: "#0A0A0A"
          }}
        >
          {/* Main Photo (Full Bleed Editorial) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.selfie_url || profile.user.avatar_url || "/placeholder.jpg"}
            alt={profile.user.full_name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Deep Gradient Overlay for Text Legibility (Silent Luxury style) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 80%)",
            }}
          />

          {/* Swipe Indicator Overlays (Subtle, no big stamps) */}
          <AnimatePresence>
            {isLiking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-10"
                style={{ background: "linear-gradient(to right, transparent, rgba(214,40,90,0.15))" }}
              />
            )}
            {isNoping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-10"
                style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.05))" }} // Very subtle gray for nope
              />
            )}
            {isSuperLiking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-10"
                style={{ background: "linear-gradient(to top, transparent, rgba(212,175,55,0.2))" }}
              />
            )}
          </AnimatePresence>


          {/* Editorial Info Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none z-20 flex flex-col justify-end">
            
            <div className="flex items-end justify-between mb-4">
              <div>
                <h1 className="font-display font-medium text-4xl tracking-tight text-[#FAFAFA] mb-1 drop-shadow-md">
                  {firstName}
                </h1>

                {/* Minimalist Relation/Table */}
                <div className="flex items-center gap-2 text-[#FAFAFA]/70 text-sm font-body tracking-wide uppercase">
                  {profile.relation_type && (
                    <span>{RELATION_LABELS[profile.relation_type] ?? profile.relation_type}</span>
                  )}
                  {profile.relation_type && profile.table_number && <span className="opacity-40">•</span>}
                  {profile.table_number && (
                    <span>Mesa {profile.table_number}</span>
                  )}
                </div>
              </div>

              {/* Posible Soul badge */}
              {isSoul && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,45,120,0.25), rgba(123,47,190,0.25))",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,45,120,0.4)",
                    color: "#FF7DB8",
                  }}
                >
                  ✦ Posible Soul
                </div>
              )}
            </div>

            {/* Frost Glass Icebreaker Chips */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                 {interests.map((interest) => {
                  const isShared = sharedInterests.includes(interest);
                  return (
                    <div
                      key={interest}
                      className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide"
                      style={{
                        background: isShared ? "rgba(255,45,120,0.18)" : "rgba(255,255,255,0.06)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: isShared ? "1px solid rgba(255,45,120,0.35)" : "1px solid rgba(255,255,255,0.04)",
                        color: isShared ? "#FF7DB8" : "#E0E0E0",
                      }}
                    >
                      {interest}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </TinderCard>

      {/* Floating Action Buttons (Outside the card so they don't swipe with it) */}
      {isTop && (
         <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-6 z-30 pointer-events-none pb-safe">
            {/* NOPE (Subtle, Small) */}
            <button
              onClick={() => handleSwipe("left")}
              aria-label="Pasar"
              className="pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: "rgba(10,10,10,0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>

            {/* SUPER LIKE / CHEERS (Gold Accent) */}
            <button
              onClick={() => { if(superLikeAvailable) handleSwipe("up") }}
              aria-label="Saludar Especial"
              disabled={!superLikeAvailable}
              className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
              style={{
                background: "rgba(10,10,10,0.8)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(212,175,55,0.3)",
                boxShadow: "0 0 20px rgba(212,175,55,0.1)",
              }}
            >
              <GlassWater className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </button>

            {/* LIKE (Brand Accent) */}
            <button
              onClick={() => handleSwipe("right")}
              aria-label="Conectar"
              className="pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{
                background: "rgba(10,10,10,0.8)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(214,40,90,0.3)",
                boxShadow: "0 0 25px rgba(214,40,90,0.15)",
              }}
            >
               <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#D6285A" strokeWidth={2}>
                 <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </button>
         </div>
      )}
    </div>
  );
}
