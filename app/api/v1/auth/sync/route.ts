import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserToDB } from "@/lib/auth/sync-user";

/**
 * POST /api/v1/auth/sync
 * Syncs the currently authenticated Supabase user to the Prisma DB.
 * Called from client after login/register to ensure user record exists.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const dbUser = await syncUserToDB(user);
    return NextResponse.json({ user: { id: dbUser.id, role: dbUser.role } });
  } catch (e) {
    console.error("Error syncing user:", e);
    return NextResponse.json({ error: "Error al sincronizar perfil" }, { status: 500 });
  }
}
