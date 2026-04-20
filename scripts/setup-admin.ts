import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // List existing users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, full_name: true },
  });
  console.log("Existing users:", JSON.stringify(users, null, 2));

  // Upsert the admin user
  const email = "alejandro.martinez.licon@gmail.com";
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN" },
    create: {
      email,
      full_name: "Alejandro Martinez",
      role: "SUPER_ADMIN",
    },
  });
  console.log("\nAdmin user set:", JSON.stringify(user, null, 2));

  await prisma.$disconnect();
  pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
