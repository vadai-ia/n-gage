/**
 * Seed script: creates a test event + dummy guest registrations for UI testing.
 * Run with: npx tsx scripts/seed-test-event.ts
 *
 * Creates:
 * - 1 event: "Noche de Conexiones" (active, no access code)
 * - 10 fake users (5 men, 5 women) with selfies from picsum.photos
 * - All registered with varied interests for Posible Soul matching
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const SLUG = "test-noche-2024";

const MALE_PHOTOS = [
  "https://picsum.photos/seed/m1/600/600",
  "https://picsum.photos/seed/m2/600/600",
  "https://picsum.photos/seed/m3/600/600",
  "https://picsum.photos/seed/m4/600/600",
  "https://picsum.photos/seed/m5/600/600",
];

const FEMALE_PHOTOS = [
  "https://picsum.photos/seed/f1/600/600",
  "https://picsum.photos/seed/f2/600/600",
  "https://picsum.photos/seed/f3/600/600",
  "https://picsum.photos/seed/f4/600/600",
  "https://picsum.photos/seed/f5/600/600",
];

const INTEREST_SETS = [
  ["Vino 🍷", "Viajes ✈️", "Fotografía 📷", "Yoga 🧘"],
  ["Música 🎵", "Cocina 🍳", "Senderismo 🥾", "Lectura 📚"],
  ["Arte 🎨", "Netflix 🎬", "Gym 💪", "Café ☕"],
  ["Baile 💃", "Playa 🏖️", "Tacos 🌮", "Fútbol ⚽"],
  ["Tech 💻", "Videojuegos 🎮", "Sushi 🍣", "Meditación 🧘"],
];

const NAMES_MALE = ["Carlos", "Andrés", "Miguel", "Diego", "Luis"];
const NAMES_FEMALE = ["Valeria", "Sofía", "Daniela", "Camila", "Fernanda"];

async function main() {
  console.log("🌱 Starting seed...");

  // Find organizer (first super admin or any user)
  const organizer = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "EVENT_ORGANIZER"] } },
  });

  if (!organizer) {
    console.error("❌ No organizer found. Run create-super-admin.ts first.");
    process.exit(1);
  }

  console.log(`👤 Using organizer: ${organizer.email}`);

  // Delete existing test event if exists
  const existing = await prisma.event.findUnique({ where: { unique_slug: SLUG } });
  if (existing) {
    console.log("🗑️  Deleting existing test event...");
    await prisma.eventLike.deleteMany({ where: { event_id: existing.id } });
    await prisma.eventRegistration.deleteMany({ where: { event_id: existing.id } });
    await prisma.event.delete({ where: { id: existing.id } });
  }

  // Create event
  const event = await prisma.event.create({
    data: {
      organizer_id: organizer.id,
      name: "Noche de Conexiones 🌙",
      type: "other",
      event_date: new Date(),
      venue_name: "Terraza Rooftop",
      venue_city: "CDMX",
      status: "active",
      unique_slug: SLUG,
      plan: "vibe",
      search_duration_minutes: 60,
      expiry_type: "custom_days",
      expiry_days: 7,
      gender_extended_mode: false,
    },
  });

  console.log(`✅ Event created: ${event.name} (slug: ${SLUG})`);

  // Create dummy users and registrations
  const dummyUsers: { id: string; name: string }[] = [];

  // Create males
  for (let i = 0; i < 5; i++) {
    const email = `test.male.${i + 1}@ngage-test.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { full_name: NAMES_MALE[i] },
      create: {
        id: `test-male-${i + 1}-${Date.now()}`,
        email,
        full_name: NAMES_MALE[i],
        role: "GUEST",
      },
    });

    await prisma.eventRegistration.create({
      data: {
        event_id: event.id,
        user_id: user.id,
        selfie_url: MALE_PHOTOS[i],
        gender: "male",
        looking_for: "women",
        interests: INTEREST_SETS[i],
        relation_type: i % 2 === 0 ? "friend_groom" : "friend_bride",
        table_number: String(i + 1),
      },
    });

    dummyUsers.push({ id: user.id, name: NAMES_MALE[i] });
    console.log(`  👨 ${NAMES_MALE[i]} registered`);
  }

  // Create females
  for (let i = 0; i < 5; i++) {
    const email = `test.female.${i + 1}@ngage-test.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { full_name: NAMES_FEMALE[i] },
      create: {
        id: `test-female-${i + 1}-${Date.now()}`,
        email,
        full_name: NAMES_FEMALE[i],
        role: "GUEST",
      },
    });

    await prisma.eventRegistration.create({
      data: {
        event_id: event.id,
        user_id: user.id,
        selfie_url: FEMALE_PHOTOS[i],
        gender: "female",
        looking_for: "men",
        interests: INTEREST_SETS[i],
        relation_type: i % 2 === 0 ? "friend_bride" : "friend_groom",
        table_number: String(i + 6),
      },
    });

    console.log(`  👩 ${NAMES_FEMALE[i]} registered`);
  }

  console.log(`\n🎉 Done! Test event ready.`);
  console.log(`\n🔗 Register URL: /e/${SLUG}`);
  console.log(`📋 Event ID: ${event.id}`);
  console.log(`🔍 Direct swipe URL: /event/${event.id}/search\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());