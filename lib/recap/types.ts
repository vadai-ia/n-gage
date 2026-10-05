// Tipos compartidos entre el cálculo del recap (server) y los componentes (client).
// Los ids de personas son alias opacos ("p1", "p2"...) — nunca se exponen user ids reales.

export type RecapGender = "male" | "female" | "non_binary" | "prefer_not_say";

export type RecapPerson = {
  id: string;
  name: string;
  photo: string | null;
  gender: RecapGender;
  team: string | null;
  table: string | null;
  interests: string[];
  likesSent: number;
  likesReceived: number;
  superLikesSent: number;
  superLikesReceived: number;
  matches: number;
  photosTaken: number;
  joinedAt: string;
};

export type RecapLike = {
  from: string;
  to: string;
  type: "like" | "super_like";
  at: string;
};

export type RecapMatch = {
  id: string;
  a: string;
  b: string;
  at: string;
  /** Who sent the first like of the pair */
  firstMove: string | null;
  messages: number;
  superLike: boolean;
  sharedInterests: string[];
  affinity: number;
  /** Seconds between the first like and the reciprocal one */
  secondsToMatch: number | null;
};

export type RecapAwardIcon =
  | "magnet" | "star" | "zap" | "heart" | "message" | "sparkles" | "atom" | "camera" | "timer";

export type RecapAward = {
  id: string;
  title: string;
  description: string;
  icon: RecapAwardIcon;
  personIds: string[];
  value: string;
  matchId?: string;
  /** For time-based awards: the client formats it in the viewer's timezone */
  at?: string;
};

export type RecapTimelineBucket = {
  t: string;
  likes: number;
  superLikes: number;
  matches: number;
  photos: number;
};

export type RecapPhoto = {
  id: string;
  url: string;
  by: string | null;
  byName: string | null;
  at: string;
};

export type RecapTeamStats = {
  bride: number;
  groom: number;
  other: number;
  /** Matches between Team Novia and Team Novio */
  crossMatches: number;
  brideMatches: number;
  groomMatches: number;
  brideLikesToGroom: number;
  groomLikesToBride: number;
};

export type RecapData = {
  event: {
    name: string;
    type: string;
    date: string;
    venue: string | null;
    city: string | null;
    cover: string | null;
    gallery: string[];
    status: string;
    slug: string;
  };
  summary: {
    participants: number;
    likes: number;
    superLikes: number;
    dislikes: number;
    matches: number;
    messages: number;
    photos: number;
    /** % of participants with at least one match */
    matchedPercent: number;
    /** % of positive likes that ended up reciprocated */
    reciprocityPercent: number;
    avgRating: number | null;
    ratingsCount: number;
    firstActivityAt: string | null;
    lastActivityAt: string | null;
  };
  people: RecapPerson[];
  likes: RecapLike[];
  matches: RecapMatch[];
  awards: RecapAward[];
  timeline: { bucketMinutes: number; buckets: RecapTimelineBucket[]; peak: RecapTimelineBucket | null };
  teams: RecapTeamStats | null;
  tables: { table: string; people: number; matches: number }[];
  interests: { label: string; count: number }[];
  genders: Record<string, number>;
  photos: RecapPhoto[];
  generatedAt: string;
};
