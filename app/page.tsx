import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = dbUser?.role ?? "GUEST";

  if (role === "SUPER_ADMIN")     redirect("/admin");
  if (role === "EVENT_ORGANIZER") redirect("/dashboard");

  // HOST o GUEST → pantalla de bienvenida
  redirect("/welcome");
}
