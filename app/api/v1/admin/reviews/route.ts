import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/is-admin";

type Order = "latest" | "top" | "bottom";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = await isAdmin(user.id);
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const orderParam = (searchParams.get("order") ?? "latest") as Order;
  const order: Order = ["latest", "top", "bottom"].includes(orderParam) ? orderParam : "latest";
  const pageRaw = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  // limit=0 (or "all") returns the full list with no pagination
  const limitParam = searchParams.get("limit") ?? "10";
  const limitRaw = limitParam === "all" ? 0 : parseInt(limitParam, 10);
  const limit = Number.isFinite(limitRaw) && limitRaw >= 0 ? limitRaw : 10;

  const reviews = await prisma.appReview.findMany({
    include: {
      user: { select: { id: true, full_name: true, email: true, avatar_url: true } },
      event: { select: { id: true, name: true, event_date: true, type: true } },
    },
    orderBy: { created_at: "desc" },
  });

  const total = reviews.length;
  const sumRating = reviews.reduce((s, r) => s + r.rating, 0);
  const avgRating = total > 0 ? +(sumRating / total).toFixed(1) : 0;
  const wouldUseAgain = reviews.filter((r) => r.would_use_again).length;
  const wouldUseAgainPct = total > 0 ? Math.round((wouldUseAgain / total) * 100) : 0;

  // Distribution 1..5 stars
  const distribution = [1, 2, 3, 4, 5].map((star) =>
    reviews.filter((r) => r.rating === star).length
  );

  // Per-event breakdown
  const byEventMap = new Map<string, {
    event_id: string;
    event_name: string;
    event_date: Date | string | null;
    event_type: string;
    count: number;
    sum_rating: number;
    would_use_again: number;
  }>();
  for (const r of reviews) {
    const key = r.event_id;
    const ev = byEventMap.get(key);
    if (ev) {
      ev.count += 1;
      ev.sum_rating += r.rating;
      if (r.would_use_again) ev.would_use_again += 1;
    } else {
      byEventMap.set(key, {
        event_id: r.event_id,
        event_name: r.event.name,
        event_date: r.event.event_date,
        event_type: r.event.type,
        count: 1,
        sum_rating: r.rating,
        would_use_again: r.would_use_again ? 1 : 0,
      });
    }
  }
  const byEvent = Array.from(byEventMap.values())
    .map((e) => ({
      event_id: e.event_id,
      event_name: e.event_name,
      event_date: e.event_date,
      event_type: e.event_type,
      count: e.count,
      avg_rating: +(e.sum_rating / e.count).toFixed(1),
      would_use_again_pct: Math.round((e.would_use_again / e.count) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Pick the ordered universe based on the requested view
  let ordered: typeof reviews;
  if (order === "top") {
    ordered = [...reviews].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } else if (order === "bottom") {
    ordered = [...reviews].sort((a, b) => {
      if (a.rating !== b.rating) return a.rating - b.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } else {
    ordered = reviews; // already created_at desc
  }

  const shape = (r: (typeof reviews)[number]) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    would_use_again: r.would_use_again,
    created_at: r.created_at,
    event: r.event,
    user: r.user,
  });

  // Pagination: limit=0 → return everything in one page
  const orderedTotal = ordered.length;
  const effectiveLimit = limit === 0 ? orderedTotal : limit;
  const totalPages = effectiveLimit > 0 ? Math.max(1, Math.ceil(orderedTotal / effectiveLimit)) : 1;
  const safePage = Math.min(page, totalPages);
  const start = effectiveLimit > 0 ? (safePage - 1) * effectiveLimit : 0;
  const end = effectiveLimit > 0 ? start + effectiveLimit : orderedTotal;
  const items = ordered.slice(start, end).map(shape);

  return NextResponse.json({
    summary: {
      total,
      avg_rating: avgRating,
      would_use_again_count: wouldUseAgain,
      would_use_again_pct: wouldUseAgainPct,
      events_reviewed: byEventMap.size,
      distribution,
    },
    by_event: byEvent,
    list: {
      order,
      page: safePage,
      limit, // echo what was requested (0 = all)
      page_size: effectiveLimit, // actual rows in this page
      total: orderedTotal,
      total_pages: totalPages,
      items,
    },
  });
}
