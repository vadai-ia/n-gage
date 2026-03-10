import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { syncUserToDB } from "@/lib/auth/sync-user";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Try to find user in DB, create if not exists
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser) {
    dbUser = await syncUserToDB(user);
  }

  const role = dbUser.role ?? "GUEST";

  if (role === "SUPER_ADMIN")     redirect("/admin");
  if (role === "EVENT_ORGANIZER") redirect("/dashboard");

  // HOST o GUEST → pantalla de bienvenida
  redirect("/welcome");
}
