/**
 * Reset completo de Supabase + seed limpio con 3 usuarios.
 * Uso: npx tsx scripts/reset-and-seed-clean.ts
 *
 * Crea:
 *  1. Super Admin   — alejandro.martinez@vadai.com.mx
 *  2. Organizer     — organizer@ngage.app
 *  3. Host          — host@ngage.app
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Users to create ───────────────────────────
const USERS = [
  {
    email: "alejandro.martinez@vadai.com.mx",
    name: "Alejandro Martinez",
    password: "#VA2025&InteligYour",
    role: "SUPER_ADMIN" as const,
  },
  {
    email: "organizer@ngage.app",
    name: "Organizador Demo",
    password: "Demo2025!",
    role: "EVENT_ORGANIZER" as const,
  },
  {
    email: "host@ngage.app",
    name: "Host Demo",
    password: "Demo2025!",
    role: "EVENT_HOST" as const,
  },
];

// ─── Main ──────────────────────────────────────
async function main() {
  console.log("\n=== RESET COMPLETO DE N'GAGE ===\n");

  // ── 1. Delete all DB data (FK order matters) ──
  console.log("1. Limpiando todas las tablas...");

  await prisma.webhookLog.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.photoReport.deleteMany();
  await prisma.eventPhoto.deleteMany();
  await prisma.matchMessage.deleteMany();
  await prisma.eventMatch.deleteMany();
  await prisma.eventLike.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.eventAccessCode.deleteMany();
  await prisma.eventHost.deleteMany();
  await prisma.event.deleteMany();
  await prisma.interestOption.deleteMany();
  await prisma.interestCategory.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("   Todas las tablas vacias.");

  // ── 2. Delete all Supabase Auth users ──
  console.log("\n2. Eliminando usuarios de Supabase Auth...");
  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = authList?.users ?? [];
  console.log(`   Encontrados: ${authUsers.length} usuarios`);

  for (const u of authUsers) {
    const { error } = await supabase.auth.admin.deleteUser(u.id);
    if (error) {
      console.log(`   WARN: No se pudo eliminar ${u.email}: ${error.message}`);
    } else {
      console.log(`   Eliminado: ${u.email}`);
    }
  }

  // ── 3. Create fresh users ──
  console.log("\n3. Creando usuarios limpios...\n");

  for (const u of USERS) {
    // Create in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role, full_name: u.name },
    });

    if (error || !data?.user) {
      throw new Error(`Error creando auth user ${u.email}: ${error?.message}`);
    }

    const authId = data.user.id;

    // Create in DB
    await prisma.user.create({
      data: {
        id: authId,
        email: u.email,
        full_name: u.name,
        role: u.role,
      },
    });

    console.log(`   [${u.role}] ${u.name} <${u.email}>`);
  }

  // ── 4. Recreate interest catalog ──
  console.log("\n4. Recreando catalogo de intereses...");
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
    const created = await prisma.interestCategory.create({
      data: { slug: cat.slug, label: cat.label, emoji: cat.emoji, order: cat.order },
    });
    for (const opt of cat.options) {
      await prisma.interestOption.create({
        data: { category_id: created.id, slug: opt.slug, label: opt.label, emoji: opt.emoji },
      });
    }
  }
  console.log("   4 categorias, 22 opciones creadas.");

  // ── Done ──
  console.log("\n=== LISTO ===");
  console.log("Usuarios creados:");
  console.log("  1. SUPER_ADMIN    — alejandro.martinez@vadai.com.mx / #VA2025&InteligYour");
  console.log("  2. EVENT_ORGANIZER — organizer@ngage.app / Demo2025!");
  console.log("  3. EVENT_HOST      — host@ngage.app / Demo2025!");
  console.log("\nAccede en: http://localhost:3000/login\n");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Error:", e.message);
  console.error(e);
  process.exit(1);
});
