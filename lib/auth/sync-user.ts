import { prisma } from "@/lib/prisma";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    phone?: string;
    role?: string;
    avatar_url?: string;
    picture?: string;
  };
};

/**
 * Upserts a user record in Prisma from Supabase auth data.
 * Called after login/register/OAuth to ensure the user exists in our DB.
 * Returns the DB user record.
 */
export async function syncUserToDB(supabaseUser: SupabaseUser) {
  const meta = supabaseUser.user_metadata ?? {};
  const email = supabaseUser.email ?? "";
  const fullName = meta.full_name || meta.name || email.split("@")[0];
  const avatarUrl = meta.avatar_url || meta.picture || null;
  const role = meta.role ?? undefined;

  const dbUser = await prisma.user.upsert({
    where: { id: supabaseUser.id },
    update: {
      email,
      full_name: fullName,
      avatar_url: avatarUrl || undefined,
      updated_at: new Date(),
    },
    create: {
      id: supabaseUser.id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: role === "SUPER_ADMIN" ? "SUPER_ADMIN"
        : role === "EVENT_ORGANIZER" ? "EVENT_ORGANIZER"
        : role === "EVENT_HOST" ? "EVENT_HOST"
        : "GUEST",
    },
  });

  return dbUser;
}
