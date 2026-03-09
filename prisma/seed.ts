/**
 * Seed de desarrollo — Data de prueba completa para N'GAGE
 * Uso: npx tsx prisma/seed.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Helpers ────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getOrCreateAuthUser(email: string, name: string, password: string): Promise<string> {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) throw new Error(`Auth error for ${email}: ${error.message}`);
  return data.user.id;
}

// ─── Main ───────────────────────────────────
async function main() {
  console.log("\n🌱 Iniciando seed de N'GAGE...\n");

  // ── 1. Get or verify Super Admin ──
  const { data: adminList } = await supabase.auth.admin.listUsers();
  const adminAuth = adminList?.users?.find((u) => u.email === "alejandro.martinez@vadai.com.mx");
  if (!adminAuth) {
    console.log("⚠️  No se encontró el Super Admin. Corre primero: npx tsx scripts/create-super-admin.ts");
    return;
  }
  const ADMIN_ID = adminAuth.id;
  console.log("✅ Super Admin encontrado:", ADMIN_ID.substring(0, 8));

  // ── 2. Create Event Organizer ──
  console.log("📋 Creando Event Organizer...");
  const ORG_ID = await getOrCreateAuthUser(
    "organizer@ngage-demo.com",
    "María García López",
    "Demo2025!"
  );
  await prisma.user.upsert({
    where: { id: ORG_ID },
    create: { id: ORG_ID, email: "organizer@ngage-demo.com", full_name: "María García López", role: "EVENT_ORGANIZER" },
    update: { role: "EVENT_ORGANIZER", full_name: "María García López" },
  });
  console.log("  ✅ Organizer:", ORG_ID.substring(0, 8));

  // ── 3. Create Event Hosts ──
  console.log("👑 Creando Event Hosts...");
  const hostData = [
    { email: "novia@ngage-demo.com", name: "Sofía Hernández", label: "Novia" },
    { email: "novio@ngage-demo.com", name: "Carlos Ramírez", label: "Novio" },
  ];
  const hostIds: string[] = [];
  for (const h of hostData) {
    const id = await getOrCreateAuthUser(h.email, h.name, "Demo2025!");
    await prisma.user.upsert({
      where: { id },
      create: { id, email: h.email, full_name: h.name, role: "EVENT_HOST" },
      update: { role: "EVENT_HOST", full_name: h.name },
    });
    hostIds.push(id);
    console.log(`  ✅ Host ${h.label}:`, id.substring(0, 8));
  }

  // ── 4. Create Demo Event ──
  console.log("🎉 Creando evento demo...");
  const EVENT_ID = randomUUID();
  const eventDate = new Date();
  eventDate.setHours(20, 0, 0, 0); // Hoy a las 8pm

  await prisma.event.upsert({
    where: { unique_slug: "boda-demo" },
    create: {
      id: EVENT_ID,
      organizer_id: ORG_ID,
      name: "Boda Sofía & Carlos",
      type: "wedding",
      event_date: eventDate,
      venue_name: "Hacienda Los Olivos",
      venue_city: "Monterrey, NL",
      status: "active",
      language: "es-MX",
      search_duration_minutes: 120,
      expiry_type: "custom_days",
      expiry_days: 7,
      unique_slug: "boda-demo",
      plan: "vibe",
      plan_guest_limit: 200,
      max_guests: 200,
      gender_extended_mode: false,
      album_release_at: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000),
      expiry_at: new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    update: {
      name: "Boda Sofía & Carlos",
      status: "active",
    },
  });
  console.log("  ✅ Evento: boda-demo");

  // Get the actual event id (in case it already existed)
  const event = await prisma.event.findUnique({ where: { unique_slug: "boda-demo" } });
  const eventId = event!.id;

  // ── 5. Assign Event Hosts ──
  for (let i = 0; i < hostIds.length; i++) {
    await prisma.eventHost.upsert({
      where: { event_id_user_id: { event_id: eventId, user_id: hostIds[i] } },
      create: { event_id: eventId, user_id: hostIds[i], label: hostData[i].label },
      update: { label: hostData[i].label },
    });
  }
  console.log("  ✅ Hosts asignados al evento");

  // ── 6. Create Access Code ──
  const existingCode = await prisma.eventAccessCode.findFirst({
    where: { event_id: eventId, code: "DEMO2025" },
  });
  if (!existingCode) {
    await prisma.eventAccessCode.create({
      data: { event_id: eventId, code: "DEMO2025", type: "global", is_active: true },
    });
  }
  console.log("  ✅ Código de acceso: DEMO2025");

  // ── 7. Create 15 Guest Users with Registrations ──
  console.log("👥 Creando 15 invitados...");

  const guests = [
    { name: "Ana Torres", email: "ana@demo.com", gender: "female" as const, looking: "men" as const, relation: "friend_bride" as const, table: "5" },
    { name: "Luis Mendoza", email: "luis@demo.com", gender: "male" as const, looking: "women" as const, relation: "friend_groom" as const, table: "3" },
    { name: "Valentina Ríos", email: "val@demo.com", gender: "female" as const, looking: "men" as const, relation: "family_bride" as const, table: "1" },
    { name: "Diego Castro", email: "diego@demo.com", gender: "male" as const, looking: "women" as const, relation: "friend_groom" as const, table: "3" },
    { name: "Camila Vargas", email: "camila@demo.com", gender: "female" as const, looking: "women" as const, relation: "friend_bride" as const, table: "7" },
    { name: "Roberto Jiménez", email: "roberto@demo.com", gender: "male" as const, looking: "men" as const, relation: "coworker" as const, table: "8" },
    { name: "Isabella Moreno", email: "isa@demo.com", gender: "female" as const, looking: "everyone" as const, relation: "friend_bride" as const, table: "2" },
    { name: "Andrés Salazar", email: "andres@demo.com", gender: "male" as const, looking: "women" as const, relation: "family_groom" as const, table: "1" },
    { name: "Mariana Luna", email: "mariana@demo.com", gender: "female" as const, looking: "men" as const, relation: "friend_bride" as const, table: "6" },
    { name: "Sebastián Rojas", email: "seb@demo.com", gender: "male" as const, looking: "women" as const, relation: "friend_groom" as const, table: "4" },
    { name: "Paula Delgado", email: "paula@demo.com", gender: "female" as const, looking: "men" as const, relation: "coworker" as const, table: "9" },
    { name: "Mateo Guzmán", email: "mateo@demo.com", gender: "male" as const, looking: "everyone" as const, relation: "friend_groom" as const, table: "5" },
    { name: "Renata Flores", email: "renata@demo.com", gender: "female" as const, looking: "men" as const, relation: "family_bride" as const, table: "2" },
    { name: "Nicolás Herrera", email: "nico@demo.com", gender: "male" as const, looking: "women" as const, relation: "friend_groom" as const, table: "6" },
    { name: "Fernanda Ortiz", email: "fer@demo.com", gender: "female" as const, looking: "men" as const, relation: "friend_bride" as const, table: "4" },
  ];

  const selfieUrls = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
  ];

  const interestSets = [
    { lifestyle: ["deportes", "viajes"], entertainment: ["rock", "series"], social: ["bailar"] },
    { lifestyle: ["mascotas", "gastronomia"], entertainment: ["pop", "peliculas"], social: ["platicar"] },
    { lifestyle: ["viajes", "arte"], entertainment: ["jazz", "series"], social: ["aire_libre"] },
    { lifestyle: ["deportes", "lectura"], entertainment: ["electronica", "videojuegos"], social: ["plan_tranquilo"] },
    { lifestyle: ["gastronomia", "arte"], entertainment: ["regional", "peliculas"], social: ["bailar"] },
  ];

  const guestIds: string[] = [];
  const searchStart = new Date();

  for (let i = 0; i < guests.length; i++) {
    const g = guests[i];
    const id = await getOrCreateAuthUser(g.email, g.name, "Demo2025!");

    await prisma.user.upsert({
      where: { id },
      create: { id, email: g.email, full_name: g.name, role: "GUEST", avatar_url: selfieUrls[i] },
      update: { full_name: g.name, avatar_url: selfieUrls[i] },
    });

    await prisma.eventRegistration.upsert({
      where: { event_id_user_id: { event_id: eventId, user_id: id } },
      create: {
        event_id: eventId,
        user_id: id,
        selfie_url: selfieUrls[i],
        table_number: g.table,
        relation_type: g.relation,
        gender: g.gender,
        looking_for: g.looking,
        interests: interestSets[i % interestSets.length],
        search_started_at: searchStart,
        search_expires_at: new Date(searchStart.getTime() + 120 * 60 * 1000),
        is_visible: true,
      },
      update: {
        selfie_url: selfieUrls[i],
        gender: g.gender,
        looking_for: g.looking,
      },
    });

    guestIds.push(id);
    console.log(`  ✅ ${g.name} (${g.gender}, busca: ${g.looking}) — Mesa ${g.table}`);
  }

  // ── 8. Create Likes ──
  console.log("❤️  Creando likes...");
  const likePairs: [number, number, "like" | "super_like"][] = [
    [0, 1, "like"],   // Ana -> Luis (F->M, compatible)
    [1, 0, "like"],   // Luis -> Ana (M->F, compatible) → MATCH
    [2, 3, "like"],   // Valentina -> Diego
    [3, 2, "like"],   // Diego -> Valentina → MATCH
    [0, 7, "like"],   // Ana -> Andrés
    [7, 0, "super_like"], // Andrés -> Ana (super like) → MATCH
    [8, 9, "like"],   // Mariana -> Sebastián
    [9, 8, "like"],   // Sebastián -> Mariana → MATCH
    [10, 13, "like"], // Paula -> Nicolás
    [13, 10, "like"], // Nicolás -> Paula → MATCH
    [14, 1, "like"],  // Fernanda -> Luis
    [4, 6, "like"],   // Camila -> Isabella (F->F, compatible because Camila looks for women, Isabella looks for everyone)
    [6, 4, "like"],   // Isabella -> Camila → MATCH
    [11, 6, "like"],  // Mateo -> Isabella (compatible, Mateo looks for everyone)
    [12, 3, "like"],  // Renata -> Diego
  ];

  for (const [fromIdx, toIdx, type] of likePairs) {
    await prisma.eventLike.upsert({
      where: {
        event_id_from_user_id_to_user_id: {
          event_id: eventId,
          from_user_id: guestIds[fromIdx],
          to_user_id: guestIds[toIdx],
        },
      },
      create: {
        event_id: eventId,
        from_user_id: guestIds[fromIdx],
        to_user_id: guestIds[toIdx],
        type,
      },
      update: { type },
    });
  }
  console.log(`  ✅ ${likePairs.length} likes creados`);

  // ── 9. Create Matches (mutual likes) ──
  console.log("💑 Creando matches...");
  const matchPairs: [number, number][] = [
    [0, 1],   // Ana & Luis
    [2, 3],   // Valentina & Diego
    [0, 7],   // Ana & Andrés
    [8, 9],   // Mariana & Sebastián
    [10, 13], // Paula & Nicolás
    [4, 6],   // Camila & Isabella
  ];

  const matchIds: string[] = [];
  for (const [aIdx, bIdx] of matchPairs) {
    const matchId = randomUUID();
    await prisma.eventMatch.upsert({
      where: {
        event_id_user_a_id_user_b_id: {
          event_id: eventId,
          user_a_id: guestIds[aIdx],
          user_b_id: guestIds[bIdx],
        },
      },
      create: {
        id: matchId,
        event_id: eventId,
        user_a_id: guestIds[aIdx],
        user_b_id: guestIds[bIdx],
        initiated_by: guestIds[aIdx],
      },
      update: {},
    });
    matchIds.push(matchId);
    console.log(`  ✅ Match: ${guests[aIdx].name} & ${guests[bIdx].name}`);
  }

  // ── 10. Create Messages in some matches ──
  console.log("💬 Creando mensajes...");
  // Get actual match IDs from DB
  const allMatches = await prisma.eventMatch.findMany({ where: { event_id: eventId } });

  if (allMatches.length > 0) {
    const m = allMatches[0]; // First match
    const convos = [
      { sender: m.user_a_id, content: "¡Hola! Vi que también estás en la mesa 5 😄" },
      { sender: m.user_b_id, content: "¡Sí! Qué divertido, no te había visto. ¿Eres amiga de Sofía?" },
      { sender: m.user_a_id, content: "Sí, desde la universidad. ¿Tú eres del lado del novio?" },
      { sender: m.user_b_id, content: "Sí, somos amigos desde la prepa. ¿Quieres bailar después?" },
      { sender: m.user_a_id, content: "¡Claro que sí! Te busco cuando pongan la música 🎶" },
    ];
    for (const msg of convos) {
      await prisma.matchMessage.create({
        data: { match_id: m.id, sender_id: msg.sender, content: msg.content },
      });
    }
    console.log("  ✅ 5 mensajes en el primer match");
  }

  if (allMatches.length > 1) {
    const m = allMatches[1];
    const convos = [
      { sender: m.user_a_id, content: "¡Match! ¿En qué mesa estás?" },
      { sender: m.user_b_id, content: "¡Mesa 3! Ven a saludar 👋" },
    ];
    for (const msg of convos) {
      await prisma.matchMessage.create({
        data: { match_id: m.id, sender_id: msg.sender, content: msg.content },
      });
    }
    console.log("  ✅ 2 mensajes en el segundo match");
  }

  // ── 11. Create Photos ──
  console.log("📸 Creando fotos del evento...");
  const photoUrls = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
    "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800",
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800",
  ];

  for (let gIdx = 0; gIdx < Math.min(10, guestIds.length); gIdx++) {
    const numPhotos = Math.min(5, Math.floor(Math.random() * 5) + 1);
    for (let p = 0; p < numPhotos; p++) {
      const photoUrl = photoUrls[p % photoUrls.length];
      await prisma.eventPhoto.create({
        data: {
          event_id: eventId,
          user_id: guestIds[gIdx],
          cloudinary_public_id: `demo/event/${eventId}/${guestIds[gIdx]}_${p}`,
          cloudinary_url: photoUrl,
          thumbnail_url: photoUrl.replace("w=800", "w=200"),
          taken_at: new Date(),
          is_visible: true, // Visible for testing
        },
      });
    }
    console.log(`  ✅ ${gIdx + 1}/10 invitados con fotos`);
  }

  // ── 12. Interest Categories Catalog ──
  console.log("🏷️  Creando catálogo de intereses...");
  const categories = [
    {
      slug: "lifestyle", label: "Estilo de vida", emoji: "🌿", order: 1,
      options: [
        { slug: "deportes", label: "Deportes", emoji: "⚽" },
        { slug: "mascotas", label: "Mascotas", emoji: "🐶" },
        { slug: "viajes", label: "Viajes", emoji: "✈️" },
        { slug: "lectura", label: "Lectura", emoji: "📚" },
        { slug: "gastronomia", label: "Gastronomía", emoji: "🍽️" },
        { slug: "arte", label: "Arte", emoji: "🎨" },
      ],
    },
    {
      slug: "entertainment", label: "Entretenimiento", emoji: "🎭", order: 2,
      options: [
        { slug: "rock", label: "Rock", emoji: "🎸" },
        { slug: "pop", label: "Pop", emoji: "🎤" },
        { slug: "electronica", label: "Electrónica", emoji: "🎧" },
        { slug: "regional", label: "Regional", emoji: "🪗" },
        { slug: "jazz", label: "Jazz", emoji: "🎷" },
        { slug: "peliculas", label: "Películas", emoji: "🎬" },
        { slug: "series", label: "Series", emoji: "📺" },
        { slug: "videojuegos", label: "Videojuegos", emoji: "🎮" },
      ],
    },
    {
      slug: "social", label: "Social", emoji: "🤝", order: 3,
      options: [
        { slug: "bailar", label: "Me gusta bailar", emoji: "💃" },
        { slug: "platicar", label: "Prefiero platicar", emoji: "💬" },
        { slug: "aire_libre", label: "Aire libre", emoji: "🌄" },
        { slug: "plan_tranquilo", label: "Plan tranquilo", emoji: "🧘" },
      ],
    },
    {
      slug: "drinks", label: "Bebidas", emoji: "🍷", order: 4,
      options: [
        { slug: "vino", label: "Vino", emoji: "🍷" },
        { slug: "cerveza", label: "Cerveza", emoji: "🍺" },
        { slug: "cocteles", label: "Cócteles", emoji: "🍸" },
        { slug: "no_bebo", label: "No bebo", emoji: "🥤" },
      ],
    },
  ];

  for (const cat of categories) {
    const created = await prisma.interestCategory.upsert({
      where: { slug: cat.slug },
      create: { slug: cat.slug, label: cat.label, emoji: cat.emoji, order: cat.order },
      update: { label: cat.label, emoji: cat.emoji, order: cat.order },
    });

    for (const opt of cat.options) {
      await prisma.interestOption.upsert({
        where: { slug: opt.slug },
        create: { category_id: created.id, slug: opt.slug, label: opt.label, emoji: opt.emoji },
        update: { label: opt.label, emoji: opt.emoji },
      });
    }
  }
  console.log("  ✅ 4 categorías, 22 opciones");

  // ── Done ──
  console.log("\n🎉 ¡Seed completado!");
  console.log("─────────────────────────────────");
  console.log("📊 Resumen:");
  console.log("   • 1 Super Admin (alejandro.martinez@vadai.com.mx)");
  console.log("   • 1 Event Organizer (organizer@ngage-demo.com)");
  console.log("   • 2 Event Hosts (novia@ngage-demo.com, novio@ngage-demo.com)");
  console.log("   • 15 Guests con registros, selfies y géneros mixtos");
  console.log("   • 1 Evento activo: 'Boda Sofía & Carlos' (slug: boda-demo)");
  console.log("   • Código de acceso: DEMO2025");
  console.log("   • 15 likes, 6 matches, mensajes de chat");
  console.log("   • ~30 fotos del evento (is_visible=true)");
  console.log("   • Catálogo de intereses completo (4 categorías)");
  console.log("─────────────────────────────────");
  console.log("🔑 Password para todos los demo users: Demo2025!");
  console.log("🌐 Accede al evento: http://localhost:3000/e/boda-demo\n");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Error en seed:", e.message);
  console.error(e);
  process.exit(1);
});
