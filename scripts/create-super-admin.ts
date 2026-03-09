/**
 * Script para crear o actualizar el usuario Super Admin
 * Uso: npx tsx scripts/create-super-admin.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const SUPER_ADMIN_EMAIL = "alejandro.martinez@vadai.com.mx";
const SUPER_ADMIN_PASSWORD = "#VA2025&InteligYour";
const SUPER_ADMIN_NAME = "Alejandro Martinez";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno SUPABASE_URL o SERVICE_ROLE_KEY");
  }

  // Admin Supabase client (service role — sin RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Prisma client
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log(`\n🔍 Buscando usuario: ${SUPER_ADMIN_EMAIL}`);

  // 1. Buscar si ya existe en Auth
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email === SUPER_ADMIN_EMAIL);

  let authUserId: string;

  if (existing) {
    console.log(`✅ Usuario ya existe en Auth (id: ${existing.id})`);
    authUserId = existing.id;

    // Actualizar password y metadata
    const { error } = await supabase.auth.admin.updateUserById(authUserId, {
      password: SUPER_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "SUPER_ADMIN", full_name: SUPER_ADMIN_NAME },
    });
    if (error) throw new Error(`Error actualizando auth: ${error.message}`);
    console.log("✅ Auth actualizado (password + metadata)");
  } else {
    console.log("➕ Creando usuario en Supabase Auth...");
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "SUPER_ADMIN", full_name: SUPER_ADMIN_NAME },
    });
    if (error || !created?.user) throw new Error(`Error creando auth: ${error?.message}`);
    authUserId = created.user.id;
    console.log(`✅ Usuario creado en Auth (id: ${authUserId})`);
  }

  // 2. Upsert en tabla users de Prisma
  const dbUser = await prisma.user.upsert({
    where: { id: authUserId },
    create: {
      id: authUserId,
      email: SUPER_ADMIN_EMAIL,
      full_name: SUPER_ADMIN_NAME,
      role: "SUPER_ADMIN",
    },
    update: {
      email: SUPER_ADMIN_EMAIL,
      full_name: SUPER_ADMIN_NAME,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Usuario en DB: id=${dbUser.id}, role=${dbUser.role}`);
  console.log("\n🚀 Super Admin listo!");
  console.log(`   Email:    ${SUPER_ADMIN_EMAIL}`);
  console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
  console.log(`   Role:     SUPER_ADMIN`);
  console.log("\n   Accede en: http://localhost:3000/login\n");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
