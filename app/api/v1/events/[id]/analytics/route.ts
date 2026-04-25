import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";

type Gender = "male" | "female" | "non_binary" | "prefer_not_say";

const GENDER_PAIRS: Array<[Gender, Gender]> = [
  ["female", "male"],
  ["male", "female"],
  ["male", "male"],
  ["female", "female"],
  ["non_binary", "male"],
  ["non_binary", "female"],
  ["non_binary", "non_binary"],
];

function pairKey(from: Gender, to: Gender) {
  return `${from}_to_${to}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  const event = await prisma.event.findFirst({
    where: admin ? { id } : { id, organizer_id: user.id },
    select: { id: true },
  });
  if (!event) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Single fetch of registrations for gender lookup + interest scoring
  const registrations = await prisma.eventRegistration.findMany({
    where: { event_id: id },
    select: { user_id: true, gender: true, interests: true, display_name: true, selfie_url: true },
  });
  const regByUserId = new Map(registrations.map((r) => [r.user_id, r]));

  const [likes, matches] = await Promise.all([
    prisma.eventLike.findMany({
      where: { event_id: id },
      select: {
        id: true, type: true, from_user_id: true, to_user_id: true, created_at: true,
      },
      orderBy: { created_at: "asc" },
    }),
    prisma.eventMatch.findMany({
      where: { event_id: id },
      select: {
        id: true, user_a_id: true, user_b_id: true, matched_at: true, initiated_by: true,
        user_a: { select: { full_name: true, avatar_url: true } },
        user_b: { select: { full_name: true, avatar_url: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { matched_at: "desc" },
    }),
  ]);

  // ── Likes breakdown ──
  const likesByType = { like: 0, dislike: 0, super_like: 0 } as Record<string, number>;
  const likesByGenderPair: Record<string, number> = {};
  const likesReceivedByUser = new Map<string, number>();

  for (const l of likes) {
    likesByType[l.type] = (likesByType[l.type] ?? 0) + 1;
    const fromGender = regByUserId.get(l.from_user_id)?.gender as Gender | undefined;
    const toGender = regByUserId.get(l.to_user_id)?.gender as Gender | undefined;
    if (fromGender && toGender && l.type !== "dislike") {
      const k = pairKey(fromGender, toGender);
      likesByGenderPair[k] = (likesByGenderPair[k] ?? 0) + 1;
    }
    if (l.type !== "dislike") {
      likesReceivedByUser.set(l.to_user_id, (likesReceivedByUser.get(l.to_user_id) ?? 0) + 1);
    }
  }

  // Top liked profiles
  const topLiked = Array.from(likesReceivedByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, count]) => {
      const r = regByUserId.get(userId);
      return {
        user_id: userId,
        count,
        display_name: r?.display_name ?? null,
        selfie_url: r?.selfie_url ?? null,
      };
    });

  // ── Matches with affinity ──
  // Affinity = interest overlap percentage between the two users
  const matchesEnriched = matches.map((m) => {
    const aReg = regByUserId.get(m.user_a_id);
    const bReg = regByUserId.get(m.user_b_id);
    const aInterests = Array.isArray(aReg?.interests) ? (aReg!.interests as string[]) : [];
    const bInterests = Array.isArray(bReg?.interests) ? (bReg!.interests as string[]) : [];
    const shared = aInterests.filter((i) => bInterests.includes(i));
    const denom = Math.max(aInterests.length, bInterests.length);
    const affinity = denom > 0 ? Math.round((shared.length / denom) * 100) : 0;
    return {
      id: m.id,
      matched_at: m.matched_at,
      initiated_by: m.initiated_by,
      user_a: {
        id: m.user_a_id,
        full_name: m.user_a.full_name,
        avatar_url: m.user_a.avatar_url,
        selfie_url: aReg?.selfie_url ?? null,
        gender: aReg?.gender ?? null,
      },
      user_b: {
        id: m.user_b_id,
        full_name: m.user_b.full_name,
        avatar_url: m.user_b.avatar_url,
        selfie_url: bReg?.selfie_url ?? null,
        gender: bReg?.gender ?? null,
      },
      shared_interests: shared,
      affinity_percent: affinity,
      messages_count: m._count.messages,
    };
  });

  // Match-rate: % of "like" (and "super_like") senders that ended up in a match
  const positiveLikeSenders = new Set(
    likes.filter((l) => l.type !== "dislike").map((l) => l.from_user_id)
  );
  const matchedUsers = new Set<string>();
  for (const m of matches) {
    matchedUsers.add(m.user_a_id);
    matchedUsers.add(m.user_b_id);
  }
  const usersWhoLikedAndMatched = Array.from(positiveLikeSenders).filter((u) => matchedUsers.has(u)).length;
  const matchConversion = positiveLikeSenders.size > 0
    ? Math.round((usersWhoLikedAndMatched / positiveLikeSenders.size) * 100)
    : 0;

  // ── Distribution: counts per gender registered ──
  const genderCounts: Record<string, number> = {};
  for (const r of registrations) {
    genderCounts[r.gender] = (genderCounts[r.gender] ?? 0) + 1;
  }

  // Average affinity across matches
  const avgAffinity = matchesEnriched.length > 0
    ? Math.round(
        matchesEnriched.reduce((s, m) => s + m.affinity_percent, 0) / matchesEnriched.length
      )
    : 0;

  return NextResponse.json({
    summary: {
      registrations_total: registrations.length,
      likes_total: likes.length,
      likes_positive: likes.filter((l) => l.type !== "dislike").length,
      super_likes_total: likesByType["super_like"] ?? 0,
      dislikes_total: likesByType["dislike"] ?? 0,
      matches_total: matches.length,
      avg_affinity_percent: avgAffinity,
      match_conversion_percent: matchConversion,
      messages_total: matches.reduce((s, m) => s + m._count.messages, 0),
    },
    likes_by_type: likesByType,
    likes_by_gender_pair: GENDER_PAIRS.reduce<Record<string, number>>((acc, [a, b]) => {
      acc[pairKey(a, b)] = likesByGenderPair[pairKey(a, b)] ?? 0;
      return acc;
    }, {}),
    gender_distribution: genderCounts,
    top_liked: topLiked,
    matches: matchesEnriched,
  });
}
