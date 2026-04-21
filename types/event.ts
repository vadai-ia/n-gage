export type EventPublic = {
  id: string;
  name: string;
  type: string;
  event_date: string;
  venue_name: string | null;
  venue_city: string | null;
  cover_image_url: string | null;
  event_photos: string[];
  status: string;
  language: string;
  search_duration_minutes: number;
  expiry_days: number;
  unique_slug: string;
  gender_extended_mode: boolean;
  match_mode: "swipe" | "mosaic";
  super_likes_max: number;
  whatsapp_group_url: string | null;
  organizer: { full_name: string };
  _count: { registrations: number };
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Boda",
  birthday: "Cumpleaños",
  corporate: "Corporativo",
  graduation: "Graduación",
  concert: "Concierto",
  cruise: "Crucero",
  other: "Evento",
};

export const RELATION_TYPE_OPTIONS = [
  { value: "friend_bride", label: "Amigo/a de la novia" },
  { value: "friend_groom", label: "Amigo/a del novio" },
  { value: "family_bride", label: "Familia de la novia" },
  { value: "family_groom", label: "Familia del novio" },
  { value: "coworker", label: "Compañero/a de trabajo" },
  { value: "other", label: "Otro" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Hombre" },
  { value: "female", label: "Mujer" },
  { value: "non_binary", label: "No binario / Otro" },
  { value: "prefer_not_say", label: "Prefiero no decir" },
];

export const LOOKING_FOR_OPTIONS = [
  { value: "women", label: "Mujeres" },
  { value: "men", label: "Hombres" },
  { value: "everyone", label: "Todos" },
  { value: "non_binary", label: "No binarios" },
];

export const INTERESTS_CATALOG = [
  {
    step: 1,
    title: "Estilo de vida",
    options: [
      { value: "sports", label: "Deportes", emoji: "⚽" },
      { value: "pets", label: "Mascotas", emoji: "🐾" },
      { value: "travel", label: "Viajes", emoji: "✈️" },
      { value: "reading", label: "Lectura", emoji: "📚" },
      { value: "gastronomy", label: "Gastronomía", emoji: "🍽️" },
      { value: "art", label: "Arte", emoji: "🎨" },
    ],
  },
  {
    step: 2,
    title: "Entretenimiento",
    options: [
      { value: "rock", label: "Rock", emoji: "🎸" },
      { value: "pop", label: "Pop", emoji: "🎤" },
      { value: "electronic", label: "Electrónica", emoji: "🎧" },
      { value: "regional", label: "Regional", emoji: "🤠" },
      { value: "movies", label: "Películas", emoji: "🎬" },
      { value: "series", label: "Series", emoji: "📺" },
      { value: "videogames", label: "Videojuegos", emoji: "🎮" },
    ],
  },
  {
    step: 3,
    title: "Social",
    options: [
      { value: "dancing", label: "Me gusta bailar", emoji: "💃" },
      { value: "talking", label: "Prefiero platicar", emoji: "💬" },
      { value: "outdoor", label: "Me gusta el aire libre", emoji: "🌿" },
      { value: "chill", label: "Soy de plan tranquilo", emoji: "☕" },
    ],
  },
];

export const DRINK_OPTIONS = [
  { value: "wine", label: "Vino 🍷" },
  { value: "beer", label: "Cerveza 🍺" },
  { value: "cocktails", label: "Cocteles 🍹" },
  { value: "nodrink", label: "No bebo 💧" },
  { value: "other", label: "Otro" },
];
