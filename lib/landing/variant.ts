/**
 * N'GAGE — Sistema de variantes de landing
 * 3 variantes: general (default), weddings, events
 *
 * Cada variante tiene:
 * - Tokens CSS (aplicados via [data-variant="..."] en <body>)
 * - Copy (eyebrow, h1, lede, CTAs, manifesto, casos, testimonios, FAQ)
 * - Imágenes (Unsplash, libres de uso)
 * - Pricing tiers
 */

export type Variant = "general" | "weddings" | "events";

export const VARIANTS: Variant[] = ["general", "weddings", "events"];

/**
 * Mapeo de variante a path de la ruta correspondiente.
 */
export const VARIANT_PATHS: Record<Variant, string> = {
  general: "/",
  weddings: "/bodas",
  events: "/eventos",
};

/**
 * Pricing tiers por variante.
 * Events => cotización a la medida (no hay precios públicos).
 */
export type PricingTier = {
  name: string;
  cap: string;
  featured?: boolean;
  badge?: string;
  price: number;
  features: string[];
};

export const PRICING: Record<"general" | "weddings", PricingTier[]> = {
  general: [
    {
      name: "Spark",
      cap: "Hasta 100 invitados",
      price: 1899,
      features: [
        "Branding básico",
        "QR único + magic link",
        "Álbum digital colectivo",
        "Soporte por chat",
        "Vida útil 24h",
      ],
    },
    {
      name: "Vibe",
      cap: "Hasta 300 invitados",
      featured: true,
      badge: "Más popular",
      price: 3299,
      features: [
        "Todo lo de Spark",
        "Dominio personalizado",
        "Branded emails",
        "Dashboard en vivo",
        "Onboarding 1:1",
      ],
    },
    {
      name: "Luxe",
      cap: "Hasta 800 invitados",
      price: 4899,
      features: [
        "Todo lo de Vibe",
        "Soporte el día del evento",
        "Custom integrations",
        "Analytics extendidos",
        "SLA prioritario",
      ],
    },
  ],
  weddings: [
    {
      name: "Spark",
      cap: "Hasta 80 invitados",
      price: 2499,
      features: [
        "Branding nupcial",
        "Save-the-date con QR",
        "Álbum digital",
        "Soporte por chat",
      ],
    },
    {
      name: "Vibe",
      cap: "Hasta 150 invitados",
      featured: true,
      badge: "Más popular",
      price: 3499,
      features: [
        "Todo lo de Spark",
        "Dominio propio",
        "Branded emails",
        "Onboarding nupcial 1:1",
      ],
    },
    {
      name: "Luxe",
      cap: "Hasta 250 invitados",
      price: 4499,
      features: [
        "Todo lo de Vibe",
        "Team support el día",
        "Analytics extendidos",
        "Concierge dedicado",
      ],
    },
    {
      name: "Royal",
      cap: "251+ invitados",
      price: 5000,
      features: [
        "Todo lo de Luxe",
        "Team in situ",
        "Custom integrations",
        "Servicio a la medida",
      ],
    },
  ],
};

/**
 * Imágenes Unsplash sin marca de agua. Cada variante tiene un set propio.
 */
export const IMAGES: Record<Variant, {
  hero: string;
  cases: string[];
  branding: string[];
  avatars: string[];
}> = {
  general: {
    hero: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80",
    cases: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80",
    ],
    branding: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80",
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=500&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80",
    ],
    avatars: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
    ],
  },
  weddings: {
    hero: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
    cases: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80",
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80",
    ],
    branding: [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=500&q=80",
      "https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=500&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80",
    ],
    avatars: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80",
    ],
  },
  events: {
    hero: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80",
    cases: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80",
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=80",
    ],
    branding: [
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=500&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&q=80",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&q=80",
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=500&q=80",
    ],
    avatars: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80",
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=120&q=80",
    ],
  },
};

/**
 * Profiles que aparecen en el PhoneMockup.
 * 8 por variante para que el loop dure y cada variante tenga personajes coherentes.
 */
export type PhoneProfile = {
  name: string;
  role: string;
  color: string;
  interests: string[];
  img: string;
};

export const PHONE_PROFILES: Record<Variant, PhoneProfile[]> = {
  general: [
    { name: "Andrea, 28", role: "Boda · Sofía & Mateo", color: "#FF2D78", interests: ["Diseño", "Mezcal", "Surf"], img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80" },
    { name: "Diego, 31", role: "Festival · Bahidorá", color: "#7B2FBE", interests: ["Música", "Film", "CDMX"], img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80" },
    { name: "Camila, 26", role: "Corp · Cemex Kickoff", color: "#1A6EFF", interests: ["Marketing", "Yoga", "Lectora"], img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80" },
    { name: "Mariana, 29", role: "Boda · Sofía & Mateo", color: "#FFB800", interests: ["Arquitecta", "Vinos", "Bici"], img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80" },
    { name: "Lucas, 30", role: "Festival · Bahidorá", color: "#FF2D78", interests: ["Producer", "Vinilo", "Trail"], img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
    { name: "Sofía, 27", role: "Crucero · Caribe", color: "#7B2FBE", interests: ["Foodie", "Salsa", "Viajes"], img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80" },
    { name: "Pablo, 33", role: "Maratón · CDMX", color: "#1A6EFF", interests: ["Runner", "Café", "Bici"], img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80" },
    { name: "Isabela, 25", role: "Graduación · ITAM", color: "#FFB800", interests: ["Finance", "Tenis", "Roma"], img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80" },
  ],
  weddings: [
    { name: "Valentina, 27", role: "Prima de la novia", color: "#D4A574", interests: ["Atelier", "París"], img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80" },
    { name: "Sebastián, 32", role: "Amigo del novio", color: "#C71F5C", interests: ["Sommelier", "Trail"], img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
    { name: "Renata, 28", role: "Mejor amiga · MOH", color: "#D4A574", interests: ["Joyería", "Roma"], img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80" },
    { name: "Andrés, 30", role: "Padrino", color: "#C71F5C", interests: ["Chef", "Oaxaca"], img: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600&q=80" },
    { name: "Camila, 29", role: "Hermana del novio", color: "#D4A574", interests: ["Arq.", "Mezcal"], img: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80" },
    { name: "Mateo, 33", role: "Tío de la novia", color: "#C71F5C", interests: ["Vinos", "Polo"], img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80" },
    { name: "Lucía, 26", role: "Bridesmaid", color: "#D4A574", interests: ["Diseño", "Yoga"], img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80" },
    { name: "Diego, 31", role: "Groomsman", color: "#C71F5C", interests: ["Whisky", "Golf"], img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80" },
  ],
  events: [
    { name: "Paula, 34", role: "Maratón · CDMX 42K", color: "#1A6EFF", interests: ["Runner", "Trail"], img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80" },
    { name: "Roberto, 29", role: "Festival · Bahidorá", color: "#0F4FCC", interests: ["Indie", "Filmmaker"], img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80" },
    { name: "Tania, 27", role: "Crossfit Open", color: "#1A6EFF", interests: ["Lifter", "Coach"], img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80" },
    { name: "Felipe, 32", role: "Concierto · Foro Sol", color: "#0F4FCC", interests: ["Rock", "Vinilo"], img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80" },
    { name: "Daniela, 28", role: "Yoga Festival", color: "#1A6EFF", interests: ["Yogi", "Vegano"], img: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80" },
    { name: "Carlos, 30", role: "Triatlón · Cancún", color: "#0F4FCC", interests: ["Tri", "Bici"], img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80" },
    { name: "Andrea, 26", role: "Coachella", color: "#1A6EFF", interests: ["Festival", "Moda"], img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80" },
    { name: "Javier, 31", role: "Tenis Open MX", color: "#0F4FCC", interests: ["Tenis", "Coach"], img: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80" },
  ],
};

/**
 * Bloques de copy de un caso de uso (con número, título y meta).
 */
export type CaseItem = { num: string; title: string; meta: string };

/**
 * Step de "Cómo funciona".
 */
export type StepItem = { icon: string; title: string; desc: string };

/**
 * Bloque de testimonio.
 */
export type Testimonial = { q: string; n: string; r: string };

/**
 * Bloque de FAQ.
 */
export type FAQItem = { q: string; a: string };

/**
 * Item del manifesto (string o JSX con <span class="accent" />).
 * Se usa como dangerouslySetInnerHTML porque el manifesto necesita
 * highlights inline. La fuente del HTML es nuestra; no es input usuario.
 */
export type ManifestoLine = string;

/**
 * Hero meta stat (pequeñas métricas debajo del lede).
 */
export type HeroMeta = { num: string; label: string };

/**
 * Stat strip que aparece bajo el manifesto.
 */
export type StatItem = { num: string; label: string };

/**
 * Contenido completo de una variante.
 */
export type VariantContent = {
  /** Sufijo del wordmark, ej. "/ WEDDINGS". Vacío para general. */
  sub: string;
  /** Etiqueta corta del switcher / nav. */
  switcherLabel: string;
  /** Texto SEO del <title>. */
  seoTitle: string;
  /** Meta description. */
  seoDescription: string;

  /** Hero */
  eyebrow: string;
  /** Hero h1: "h1Pre <em>h1Em</em> h1Post" */
  h1Pre: string;
  h1Em: string;
  h1Post: string;
  /** Lede HTML con <span class="accent">…</span>. Sanitized at build time (literal). */
  ledeHtml: string;
  cta1: string;
  cta2: string;
  heroMeta: HeroMeta[];

  /** Manifesto */
  manifestoHtml: string[];
  manifestoSig: string;

  /** Pull-quote (antes del form de contacto) */
  pullquoteHtml: string;

  /** Casos */
  casesEyebrow: string;
  casesTitleHtml: string;
  casesSubHtml: string;
  cases: CaseItem[];

  /** Cómo funciona */
  howSubHtml: string;
  howSteps: StepItem[];

  /** Branding showcase */
  brandingTitleHtml: string;
  brandingDesc: string;
  brandingChips: string[];

  /** Testimonios */
  testimonials: Testimonial[];

  /** FAQ */
  faqs: FAQItem[];

  /** Form */
  formTypes: string[];

  /** Stat strip (manifesto) */
  stats: StatItem[];
};

export const CONTENT: Record<Variant, VariantContent> = {
  general: {
    sub: "",
    switcherLabel: "N'GAGE",
    seoTitle: "N'GAGE — Conecta. Aquí y ahora.",
    seoDescription:
      "La infraestructura social de los eventos en vivo. Bodas, festivales, conciertos, corporativos. Brandeable, efímera, medible.",

    eyebrow: "La gente quiere volver a conectar",
    h1Pre: "Estamos juntos,",
    h1Em: "sin conectar",
    h1Post: "de verdad.",
    ledeHtml: `Vivimos rodeados de gente y nunca nos hemos sentido tan <span class="accent">solos</span>. N'GAGE convierte cada evento en una <span class="accent-2">excusa real para conocer a alguien</span> — una conversación, una historia, una conexión que no se queda en el feed.`,
    cta1: "Quiero esto en mi evento",
    cta2: "Ver cómo funciona",
    heroMeta: [
      { num: "3.2x", label: "Más conexiones" },
      { num: "87%", label: "Vuelven a hablar" },
      { num: "0", label: "Apps que bajar" },
    ],

    manifestoHtml: [
      "Vivimos hiperconectados, hipersolos.",
      `El feed está lleno. La mesa está vacía. Lo que buscamos es <span class="accent">una mirada</span>, <span class="accent">una historia</span>, <span class="accent">una razón para quedarnos</span>.`,
      `Las personas no quieren más plataformas. Quieren <span class="accent-2">volver a sentir</span>. Volver a llegar tarde a casa porque no querían irse.`,
      `N'GAGE es esa <em>chispa</em> que pasa cuando dos extraños se vuelven inolvidables.`,
    ],
    manifestoSig: "N'GAGE · MX · 2026",
    pullquoteHtml: `La vida son <span class="accent">los momentos</span>. Y los momentos son <span class="accent-2">la gente con la que pasan</span>.`,

    casesEyebrow: "Ocho mundos, una plataforma",
    casesTitleHtml: `Donde haya gente reunida, <em>hay <span class="accent-underline">magia</span></em>.`,
    casesSubHtml: `Mismo corazón. <span class="accent">Mil personalidades</span>.`,
    cases: [
      { num: "01", title: "Bodas", meta: "50 — 800 invitados" },
      { num: "02", title: "Festivales", meta: "5K — 50K asistentes" },
      { num: "03", title: "Corporativos", meta: "Kickoffs · offsites" },
      { num: "04", title: "Conciertos", meta: "Arena · estadio" },
      { num: "05", title: "Cruceros", meta: "Multi-noche" },
      { num: "06", title: "Graduaciones", meta: "Universidad · MBA" },
      { num: "07", title: "Deportivos", meta: "Maratones · torneos" },
      { num: "08", title: "Activaciones", meta: "Branded events" },
    ],

    howSubHtml: `Diseñado para que la <span class="accent">magia</span> ocurra sin que nadie lo note. Listo en <span class="accent">48 horas</span>.`,
    howSteps: [
      { icon: "✦", title: "Brandeas el evento", desc: "Logo, paleta, copy. La plataforma se viste con tu identidad en minutos." },
      { icon: "◐", title: "Asistentes escanean", desc: "QR o magic link. Sin descargas. Selfie del día reemplaza el avatar." },
      { icon: "◊", title: "Conectan en vivo", desc: "Matching por intereses, mesa, rol o vínculo con los anfitriones." },
      { icon: "✺", title: "Mides cada conexión", desc: "Dashboard en vivo. Métricas de engagement. Album colectivo." },
    ],

    brandingTitleHtml: `Tu identidad, <em>en cada pixel.</em>`,
    brandingDesc: "Logo, paleta, tipografía, copy. Onboarding personalizado en menos de 24h.",
    brandingChips: ["BODAS", "FESTIVAL", "CORP", "MARCA", "DEPORTE"],

    testimonials: [
      { q: "El día del evento, la app se sintió nuestra. Brandeada al 100%. Nuestros invitados no supieron que era N'GAGE hasta el final.", n: "Julia M.", r: "Productora · Festival" },
      { q: "Networking en eventos siempre fue ruido y tarjetas. Ahora son métricas, conexiones y un álbum.", n: "Ricardo T.", r: "Director · Conferencia" },
      { q: "En mi boda conocí gente que mi prima conoce desde hace 15 años. La app lo hizo natural.", n: "Camila V.", r: "Novia · CDMX" },
    ],

    faqs: [
      { q: "¿Necesitan descargar una app?", a: "No. Los invitados escanean un QR y entran directo. Funciona en cualquier smartphone moderno." },
      { q: "¿Cuánto se tarda en estar listo?", a: "48 horas desde firma. Onboarding incluye sesión de branding, configuración técnica y dry-run." },
      { q: "¿Quién es el dueño de los datos?", a: "Tú. First-party. Aviso de privacidad transparente. Datos eliminados 30 días después del evento." },
      { q: "¿Qué pasa si mi evento es bilingüe?", a: "Soporte ES / EN nativo. Cualquier idioma adicional vía custom dictionary." },
    ],

    formTypes: ["Boda", "Festival", "Corporativo", "Deportivo", "Crucero", "Otro"],

    stats: [
      { num: "87%", label: "Engagement" },
      { num: "3.2x", label: "Conexiones" },
      { num: "48h", label: "Setup" },
      { num: "0", label: "Descargas" },
    ],
  },

  weddings: {
    sub: "/ WEDDINGS",
    switcherLabel: "/ WEDDINGS",
    seoTitle: "N'GAGE Weddings — La app que vive solo el día de tu boda",
    seoDescription:
      "Convierte tu boda en la noche que todos van a recordar. Brandeable, efímera, hecha para que tus invitados se conozcan.",

    eyebrow: "La app que vive solo el día de tu boda",
    h1Pre: "Reúnes a las personas que más amas",
    h1Em: "y casi nadie",
    h1Post: "se conocen entre ellas.",
    ledeHtml: `Tus amigos del trabajo, tus primos, los amigos de él. Todos en el mismo lugar y casi nadie se habla. N'GAGE rompe ese <span class="accent">muro invisible</span> entre mesas y convierte tu boda en la <span class="accent-2">reunión que todos van a recordar</span>.`,
    cta1: "Reserva tu fecha",
    cta2: "Ver cómo funciona",
    heroMeta: [
      { num: "4 de 5", label: "Hicieron un amigo nuevo" },
      { num: "100%", label: "Con tu identidad" },
      { num: "$0", label: "Para tus invitados" },
    ],

    manifestoHtml: [
      "Tu boda no es un evento. Es una declaración.",
      `Es decirle al mundo: estas son <span class="accent">las personas que me hicieron quien soy</span>. Y por una sola noche, todas están en el mismo lugar.`,
      `Pero tu mejor amiga nunca conocerá a tu primo. Y eso, en la noche más importante de tu vida, <span class="accent">duele un poquito</span>.`,
      `N'GAGE convierte a desconocidos en cómplices, y a tu boda en <span class="accent-2">la noche que todos van a recordar como la mejor de su vida</span>.`,
    ],
    manifestoSig: "N'GAGE / WEDDINGS · MX · 2026",
    pullquoteHtml: `No recordarás el menú. Recordarás <span class="accent-2">con quién bailaste</span> hasta las cuatro.`,

    casesEyebrow: "Cuatro escenarios",
    casesTitleHtml: `Tu boda. <em>Tu <span class="accent-underline">universo</span>.</em>`,
    casesSubHtml: `Mismo corazón. <span class="accent">Mil personalidades</span>.`,
    cases: [
      { num: "01", title: "Hacienda", meta: "México · Querétaro" },
      { num: "02", title: "Playa", meta: "Tulum · Sayulita" },
      { num: "03", title: "Jardín", meta: "Cuernavaca · Valle" },
      { num: "04", title: "Urbana", meta: "CDMX · MTY · GDL" },
    ],

    howSubHtml: `Diseñado para que la <span class="accent">magia</span> ocurra sin que nadie lo note. Listo en <span class="accent">48 horas</span>.`,
    howSteps: [
      { icon: "✦", title: "Brandeas tu boda", desc: "Subes invitación, paleta y nombres. La app se viste con tu identidad en minutos." },
      { icon: "◐", title: "Tus invitados escanean", desc: "QR en save-the-date o mesa. Sin descargas. Selfie del día reemplaza el avatar." },
      { icon: "◊", title: "Conectan en vivo", desc: "Mientras la fiesta avanza, ven quién es quién. Por interés, mesa o vínculo." },
      { icon: "✺", title: "El álbum eterno", desc: "Fotos colectivas, mensajes y conexiones quedan como recuerdo de tu día." },
    ],

    brandingTitleHtml: `Tu boda. <em>Tu marca.</em>`,
    brandingDesc: "Tipografía, paleta, logo, fotos. La app se vuelve una extensión de tu identidad nupcial.",
    brandingChips: ["S & M", "V & R", "A & N", "L & D", "M & C"],

    testimonials: [
      { q: "Mi tía conoció al primo de mi esposo. Hoy son inseparables. Eso, en una boda, no tiene precio.", n: "Sofía R.", r: "Novia · Hacienda" },
      { q: "Mis invitados pasaron de scrollear a conectarse. Pista llena toda la noche.", n: "Mariana L.", r: "Wedding planner" },
      { q: "El día siguiente, todos hablaban de a quién conocieron. No del menú. Eso es ganar.", n: "Andrés & Vale", r: "Boda · Tulum" },
    ],

    faqs: [
      { q: "¿Y si mis abuelos no saben usar smartphone?", a: "El QR los lleva directo a una vista simple. Sin descargas, sin password. Si prefieren, pueden ver el álbum impreso al final." },
      { q: "¿Cómo se ve con el tema de mi boda?", a: "100% brandeable: paleta, tipografía, fotos, copy. Trabajamos contigo o tu wedding planner para que la app se sienta una extensión natural." },
      { q: "¿Funciona en haciendas sin señal?", a: "Sí. Modo offline-first activado por default. Las conexiones se sincronizan al volver señal." },
      { q: "¿Qué pasa con las fotos al final?", a: "Se compilan en un álbum digital colectivo que ustedes descargan en alta calidad. La app se desactiva 24h después." },
    ],

    formTypes: ["Boda", "XV años", "Aniversario", "Compromiso"],

    stats: [
      { num: "4 de 5", label: "Amigo nuevo" },
      { num: "100%", label: "Tu marca" },
      { num: "48h", label: "Setup" },
      { num: "$0", label: "Por invitado" },
    ],
  },

  events: {
    sub: "/ EVENTS",
    switcherLabel: "/ EVENTS",
    seoTitle: "N'GAGE Events — Convierte asistentes en comunidad",
    seoDescription:
      "Mide y multiplica el ROI emocional de tus eventos corporativos, deportivos y branded. Multi-tenant, integrado a tu CRM.",

    eyebrow: "Convierte asistentes en comunidad",
    h1Pre: "Llegó mucha gente.",
    h1Em: "¿Conocieron a",
    h1Post: "alguien?",
    ledeHtml: `El verdadero éxito de un evento no se mide en asistentes, se mide en <span class="accent-2">a quién se llevaron a casa</span>. N'GAGE convierte tu próximo maratón, festival o concierto en una excusa para que la gente se conozca — y vuelva a tu marca por <span class="accent">esa</span> razón.`,
    cta1: "Cuéntanos de tu evento",
    cta2: "Ver casos",
    heroMeta: [
      { num: "4,200+", label: "Conexiones por evento" },
      { num: "73%", label: "Repiten asistencia" },
      { num: "6.2x", label: "Más menciones orgánicas" },
    ],

    manifestoHtml: [
      "Producimos eventos enormes para que la gente sienta algo.",
      `Y nos conformamos con <em>"estuvo padre"</em> como métrica. La verdad: tu evento compite contra <span class="accent">quedarse en casa viendo Netflix</span>.`,
      `La única forma de ganar es darle a la gente lo que el feed no puede: <span class="accent-2">una razón humana para volver</span>. Alguien con quien rieron. Alguien que les hizo decir "qué buen evento, conocí a..."`,
      `Lo que se conecta, <em>se queda</em>. Lo que se queda, <span class="accent">vuelve</span>.`,
    ],
    manifestoSig: "N'GAGE / EVENTS · MX · 2026",
    pullquoteHtml: `Lo que se <span class="accent">conecta</span>, se queda. Lo que se queda, <span class="accent-2">vuelve</span>.`,

    casesEyebrow: "Verticales",
    casesTitleHtml: `Donde la marca <em><span class="accent-underline">vive</span></em>.`,
    casesSubHtml: `Cada vertical con su <span class="accent">propia personalidad</span>.`,
    cases: [
      { num: "01", title: "Corporativos", meta: "Kickoffs · offsites" },
      { num: "02", title: "Deportivos", meta: "Maratón · torneo" },
      { num: "03", title: "Festivales", meta: "Marca · sponsorship" },
      { num: "04", title: "Conferencias", meta: "B2B · summit" },
    ],

    howSubHtml: `Multi-tenant, multi-evento, multi-marca. Listo en <span class="accent">48 horas</span>.`,
    howSteps: [
      { icon: "◈", title: "Configuras el evento", desc: "Marca, agenda, segmentos. Multi-marca y multi-evento desde un dashboard." },
      { icon: "◐", title: "Asistentes hacen check-in", desc: "QR o magic link. Datos first-party. Compliance integrado (LFPDPPP, GDPR)." },
      { icon: "◊", title: "Networking medible", desc: "Matching por rol, industria e intereses. Cada interacción se registra." },
      { icon: "◇", title: "Insights al CRM", desc: "Webhook a Salesforce, HubSpot o Slack. ROI emocional cuantificado." },
    ],

    brandingTitleHtml: `Una marca, <em>muchos eventos.</em>`,
    brandingDesc: "Multi-tenant. Cada marca y cada evento con su propio sub-dominio, tokens y assets.",
    brandingChips: ["CEMEX", "BIMBO", "FEMSA", "BANAMEX", "LIVERPOOL"],

    testimonials: [
      { q: "Pasamos de 'estuvo padre' a 4,200 conexiones medibles entre asistentes. ROI por fin métrica de Q.", n: "Paula M.", r: "VP Brand · Cemex" },
      { q: "Multi-tenant nos permitió correr 12 activaciones distintas en un trimestre con un solo equipo.", n: "Roberto C.", r: "Head HR · Bimbo" },
      { q: "Integración con Salesforce en una semana. Webhook bidireccional. Compliance no fue obstáculo.", n: "Felipe O.", r: "CMO · Banamex" },
    ],

    faqs: [
      { q: "¿Cómo se integra con nuestro CRM?", a: "Webhook bidireccional con Salesforce, HubSpot, Marketo. Custom integrations vía API REST. SDK disponible." },
      { q: "¿Qué pasa con los datos de los empleados?", a: "Multi-tenant aislado. Compliance LFPDPPP, GDPR. SOC 2 en roadmap. DPA y aviso de privacidad disponibles." },
      { q: "¿Tenemos SLA?", a: "99.9% uptime garantizado en plan Enterprise. Dedicated CSM. Response SLA de 4h en business hours." },
      { q: "¿Multi-tenant significa que mis datos están aislados?", a: "Aislamiento a nivel de schema en Postgres. Encriptación at-rest y in-transit. Data residency configurable." },
    ],

    formTypes: ["Corporativo", "Deportivo", "Branded activation", "Conferencia"],

    stats: [
      { num: "4,200+", label: "Conexiones" },
      { num: "73%", label: "Repiten" },
      { num: "6.2x", label: "Menciones" },
      { num: "1h", label: "SLA response" },
    ],
  },
};

/**
 * Helper: dado un pathname, devuelve la variante correspondiente.
 */
export function variantFromPath(pathname: string | null | undefined): Variant {
  if (!pathname) return "general";
  if (pathname.startsWith("/bodas")) return "weddings";
  if (pathname.startsWith("/eventos")) return "events";
  return "general";
}
