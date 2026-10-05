import { prisma } from "@/lib/prisma";
import type {
  RecapAward, RecapData, RecapGender, RecapLike, RecapMatch, RecapPerson,
  RecapPhoto, RecapTeamStats, RecapTimelineBucket,
} from "./types";

const BRIDE_RELATIONS = new Set(["friend_bride", "family_bride"]);
const GROOM_RELATIONS = new Set(["friend_groom", "family_groom"]);
const BUCKET_SIZES_MIN = [5, 10, 15, 30, 60, 120, 240, 720, 1440];
const MAX_BUCKETS = 36;

function firstName(fullName: string | null | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0];
  return first || null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `en ${Math.max(1, Math.round(seconds))} seg`;
  const min = Math.round(seconds / 60);
  if (min < 60) return `en ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `en ${h} h ${m} min` : `en ${h} h`;
}

/** People with the highest value of a metric (ties included, max 3). Empty if the max is 0. */
function topBy(people: RecapPerson[], metric: (p: RecapPerson) => number): { ids: string[]; value: number } {
  const max = people.reduce((m, p) => Math.max(m, metric(p)), 0);
  if (max === 0) return { ids: [], value: 0 };
  return { ids: people.filter((p) => metric(p) === max).slice(0, 3).map((p) => p.id), value: max };
}

export async function buildRecap(eventId: string): Promise<RecapData | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      name: true, type: true, event_date: true, venue_name: true, venue_city: true,
      cover_image_url: true, event_photos: true, status: true, unique_slug: true,
    },
  });
  if (!event) return null;

  // Secuencial a propósito: el pool de Prisma tiene 1 conexión por instancia
  const registrations = await prisma.eventRegistration.findMany({
    where: { event_id: eventId },
    select: {
      user_id: true, display_name: true, selfie_url: true, gender: true, relation_type: true,
      table_number: true, table_visible: true, interests: true, created_at: true,
      user: { select: { full_name: true, avatar_url: true, deleted_at: true } },
    },
    orderBy: { created_at: "asc" },
  });
  const rawLikes = await prisma.eventLike.findMany({
    where: { event_id: eventId },
    select: { from_user_id: true, to_user_id: true, type: true, created_at: true },
    orderBy: { created_at: "asc" },
  });
  const rawMatches = await prisma.eventMatch.findMany({
    where: { event_id: eventId },
    select: {
      id: true, user_a_id: true, user_b_id: true, matched_at: true,
      _count: { select: { messages: true } },
    },
    orderBy: { matched_at: "asc" },
  });
  // Excluye fotos que moderación retiró (reporte resuelto)
  const rawPhotos = await prisma.eventPhoto.findMany({
    where: { event_id: eventId, reports: { none: { status: "resolved" } } },
    select: { id: true, user_id: true, cloudinary_url: true, taken_at: true },
    orderBy: { taken_at: "asc" },
  });
  const reviews = await prisma.appReview.aggregate({
    where: { event_id: eventId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  // ── People ──
  const aliasByUser = new Map<string, string>();
  const relationByAlias = new Map<string, string | null>();
  const rawTableByAlias = new Map<string, string | null>();
  const people: RecapPerson[] = registrations.map((r, i) => {
    const id = `p${i + 1}`;
    aliasByUser.set(r.user_id, id);
    relationByAlias.set(id, r.relation_type);
    rawTableByAlias.set(id, r.table_number?.trim() || null);
    const deleted = !!r.user.deleted_at;
    const team = r.relation_type && BRIDE_RELATIONS.has(r.relation_type) ? "Team Novia"
      : r.relation_type && GROOM_RELATIONS.has(r.relation_type) ? "Team Novio"
      : null;
    return {
      id,
      name: deleted ? "Invitado" : r.display_name?.trim() || firstName(r.user.full_name) || "Invitado",
      photo: deleted ? null : r.selfie_url || r.user.avatar_url || null,
      gender: r.gender as RecapGender,
      team,
      table: r.table_visible ? r.table_number?.trim() || null : null,
      interests: asStringArray(r.interests),
      likesSent: 0, likesReceived: 0, superLikesSent: 0, superLikesReceived: 0,
      matches: 0, photosTaken: 0,
      joinedAt: r.created_at.toISOString(),
    };
  });
  const personById = new Map(people.map((p) => [p.id, p]));

  // ── Likes ──
  let dislikes = 0;
  const likes: RecapLike[] = [];
  const likeAt = new Map<string, Date>();
  for (const l of rawLikes) {
    const from = aliasByUser.get(l.from_user_id);
    const to = aliasByUser.get(l.to_user_id);
    if (!from || !to) continue;
    if (l.type === "dislike") { dislikes++; continue; }
    likes.push({ from, to, type: l.type, at: l.created_at.toISOString() });
    likeAt.set(`${from}|${to}`, l.created_at);
    const sender = personById.get(from)!;
    const receiver = personById.get(to)!;
    sender.likesSent++;
    receiver.likesReceived++;
    if (l.type === "super_like") { sender.superLikesSent++; receiver.superLikesReceived++; }
  }
  const superLikePairs = new Set(likes.filter((l) => l.type === "super_like").map((l) => `${l.from}|${l.to}`));
  const reciprocated = likes.filter((l) => likeAt.has(`${l.to}|${l.from}`)).length;

  // ── Matches ──
  const matches: RecapMatch[] = [];
  for (const m of rawMatches) {
    const a = aliasByUser.get(m.user_a_id);
    const b = aliasByUser.get(m.user_b_id);
    if (!a || !b) continue;
    const pa = personById.get(a)!;
    const pb = personById.get(b)!;
    pa.matches++;
    pb.matches++;
    const shared = pa.interests.filter((i) => pb.interests.includes(i));
    const denom = Math.max(pa.interests.length, pb.interests.length);
    const ab = likeAt.get(`${a}|${b}`);
    const ba = likeAt.get(`${b}|${a}`);
    matches.push({
      id: `m${matches.length + 1}`,
      a, b,
      at: m.matched_at.toISOString(),
      firstMove: ab && ba ? (ab.getTime() <= ba.getTime() ? a : b) : null,
      messages: m._count.messages,
      superLike: superLikePairs.has(`${a}|${b}`) || superLikePairs.has(`${b}|${a}`),
      sharedInterests: shared,
      affinity: denom > 0 ? Math.round((shared.length / denom) * 100) : 0,
      secondsToMatch: ab && ba ? Math.abs(ab.getTime() - ba.getTime()) / 1000 : null,
    });
  }

  // ── Photos ──
  const photos: RecapPhoto[] = rawPhotos.map((p) => {
    const by = aliasByUser.get(p.user_id) ?? null;
    const person = by ? personById.get(by) : undefined;
    if (person) person.photosTaken++;
    return { id: p.id, url: p.cloudinary_url, by, byName: person?.name ?? null, at: p.taken_at.toISOString() };
  });

  // ── Awards ──
  const awards: RecapAward[] = [];
  const pushPersonAward = (
    id: string, title: string, description: string, icon: RecapAward["icon"],
    metric: (p: RecapPerson) => number, unit: [string, string],
  ) => {
    const top = topBy(people, metric);
    if (top.ids.length === 0) return;
    awards.push({ id, title, description, icon, personIds: top.ids, value: `${top.value} ${top.value === 1 ? unit[0] : unit[1]}` });
  };
  pushPersonAward("magnet", "Imán de la noche", "Quien más likes recibió", "magnet", (p) => p.likesReceived, ["like", "likes"]);
  pushPersonAward("star", "Súper estrella", "Quien más super likes recibió", "star", (p) => p.superLikesReceived, ["super like", "super likes"]);
  pushPersonAward("heart", "Rompecorazones", "Quien más matches hizo", "heart", (p) => p.matches, ["match", "matches"]);
  pushPersonAward("zap", "Sin miedo al éxito", "Quien más likes repartió", "zap", (p) => p.likesSent, ["like", "likes"]);

  if (matches.length > 0) {
    const first = matches[0];
    awards.push({
      id: "first", title: "El primer match", description: "La pareja que abrió la noche",
      icon: "sparkles", personIds: [first.a, first.b], value: "", matchId: first.id, at: first.at,
    });
  }
  const fastest = matches
    .filter((m) => m.secondsToMatch !== null)
    .sort((x, y) => x.secondsToMatch! - y.secondsToMatch!)[0];
  if (fastest) {
    awards.push({
      id: "fastest", title: "Flechazo", description: "El like correspondido más rápido",
      icon: "timer", personIds: [fastest.a, fastest.b], value: formatDuration(fastest.secondsToMatch!), matchId: fastest.id,
    });
  }
  const chattiest = [...matches].sort((x, y) => y.messages - x.messages)[0];
  if (chattiest && chattiest.messages > 0) {
    awards.push({
      id: "chat", title: "La plática del año", description: "La conversación más larga",
      icon: "message", personIds: [chattiest.a, chattiest.b],
      value: `${chattiest.messages} ${chattiest.messages === 1 ? "mensaje" : "mensajes"}`, matchId: chattiest.id,
    });
  }
  const chemistry = matches
    .filter((m) => m.sharedInterests.length > 0)
    .sort((x, y) => y.affinity - x.affinity || y.sharedInterests.length - x.sharedInterests.length)[0];
  if (chemistry) {
    awards.push({
      id: "chemistry", title: "Química perfecta", description: "La pareja con más gustos en común",
      icon: "atom", personIds: [chemistry.a, chemistry.b], value: `${chemistry.affinity}% afinidad`, matchId: chemistry.id,
    });
  }
  pushPersonAward("camera", "Paparazzi", "Quien más fotos tomó", "camera", (p) => p.photosTaken, ["foto", "fotos"]);

  // ── Timeline ──
  const activity: { t: number; kind: "like" | "super_like" | "match" | "photo" }[] = [
    ...likes.map((l) => ({ t: Date.parse(l.at), kind: l.type })),
    ...matches.map((m) => ({ t: Date.parse(m.at), kind: "match" as const })),
    ...photos.map((p) => ({ t: Date.parse(p.at), kind: "photo" as const })),
  ];
  let bucketMinutes = 15;
  let buckets: RecapTimelineBucket[] = [];
  let peak: RecapTimelineBucket | null = null;
  let firstActivityAt: string | null = null;
  let lastActivityAt: string | null = null;
  if (activity.length > 0) {
    const min = Math.min(...activity.map((a) => a.t));
    const max = Math.max(...activity.map((a) => a.t));
    firstActivityAt = new Date(min).toISOString();
    lastActivityAt = new Date(max).toISOString();
    const spanMin = (max - min) / 60000;
    bucketMinutes = BUCKET_SIZES_MIN.find((s) => spanMin / s <= MAX_BUCKETS) ?? 1440;
    const size = bucketMinutes * 60000;
    const start = Math.floor(min / size) * size;
    const count = Math.floor((max - start) / size) + 1;
    const counts = Array.from({ length: count }, () => ({ likes: 0, superLikes: 0, matches: 0, photos: 0 }));
    for (const a of activity) {
      const c = counts[Math.floor((a.t - start) / size)];
      if (a.kind === "like") c.likes++;
      else if (a.kind === "super_like") c.superLikes++;
      else if (a.kind === "match") c.matches++;
      else c.photos++;
    }
    buckets = counts.map((c, i) => ({ t: new Date(start + i * size).toISOString(), ...c }));
    peak = buckets.reduce<RecapTimelineBucket | null>((best, b) => {
      const score = b.likes + b.superLikes + b.matches;
      return !best || score > best.likes + best.superLikes + best.matches ? b : best;
    }, null);
  }

  // ── Teams (bodas) ──
  let teams: RecapTeamStats | null = null;
  const teamOf = (id: string) => {
    const rel = relationByAlias.get(id);
    return rel && BRIDE_RELATIONS.has(rel) ? "bride" : rel && GROOM_RELATIONS.has(rel) ? "groom" : "other";
  };
  if (people.some((p) => p.team)) {
    teams = { bride: 0, groom: 0, other: 0, crossMatches: 0, brideMatches: 0, groomMatches: 0, brideLikesToGroom: 0, groomLikesToBride: 0 };
    for (const p of people) teams[teamOf(p.id)]++;
    for (const m of matches) {
      const ta = teamOf(m.a);
      const tb = teamOf(m.b);
      if ((ta === "bride" && tb === "groom") || (ta === "groom" && tb === "bride")) teams.crossMatches++;
      else if (ta === "bride" && tb === "bride") teams.brideMatches++;
      else if (ta === "groom" && tb === "groom") teams.groomMatches++;
    }
    for (const l of likes) {
      if (teamOf(l.from) === "bride" && teamOf(l.to) === "groom") teams.brideLikesToGroom++;
      if (teamOf(l.from) === "groom" && teamOf(l.to) === "bride") teams.groomLikesToBride++;
    }
  }

  // ── Tables ──
  const tableStats = new Map<string, { people: number; matches: number }>();
  for (const table of Array.from(rawTableByAlias.values())) {
    if (!table) continue;
    const s = tableStats.get(table) ?? { people: 0, matches: 0 };
    s.people++;
    tableStats.set(table, s);
  }
  for (const m of matches) {
    const involved = new Set([rawTableByAlias.get(m.a), rawTableByAlias.get(m.b)].filter((t): t is string => !!t));
    involved.forEach((t) => { tableStats.get(t)!.matches++; });
  }
  const tables = Array.from(tableStats.entries())
    .map(([table, s]) => ({ table, ...s }))
    .filter((t) => t.matches > 0)
    .sort((x, y) => y.matches - x.matches || y.people - x.people)
    .slice(0, 5);

  // ── Interests & genders ──
  const interestCounts = new Map<string, number>();
  const genders: Record<string, number> = {};
  for (const p of people) {
    for (const i of p.interests) interestCounts.set(i, (interestCounts.get(i) ?? 0) + 1);
    genders[p.gender] = (genders[p.gender] ?? 0) + 1;
  }
  const interests = Array.from(interestCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((x, y) => y.count - x.count)
    .slice(0, 10);

  const matchedPeople = people.filter((p) => p.matches > 0).length;

  return {
    event: {
      name: event.name,
      type: event.type,
      date: event.event_date.toISOString(),
      venue: event.venue_name,
      city: event.venue_city,
      cover: event.cover_image_url || event.event_photos[0] || null,
      gallery: event.event_photos,
      status: event.status,
      slug: event.unique_slug,
    },
    summary: {
      participants: people.length,
      likes: likes.length,
      superLikes: likes.filter((l) => l.type === "super_like").length,
      dislikes,
      matches: matches.length,
      messages: matches.reduce((s, m) => s + m.messages, 0),
      photos: photos.length,
      matchedPercent: people.length > 0 ? Math.round((matchedPeople / people.length) * 100) : 0,
      reciprocityPercent: likes.length > 0 ? Math.round((reciprocated / likes.length) * 100) : 0,
      avgRating: reviews._avg.rating !== null ? Math.round(reviews._avg.rating * 10) / 10 : null,
      ratingsCount: reviews._count._all,
      firstActivityAt,
      lastActivityAt,
    },
    people,
    likes,
    matches,
    awards,
    timeline: { bucketMinutes, buckets, peak },
    teams,
    tables,
    interests,
    genders,
    photos,
    generatedAt: new Date().toISOString(),
  };
}
