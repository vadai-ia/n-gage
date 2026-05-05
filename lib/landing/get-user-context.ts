import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type LandingUserContext = {
  isLoggedIn: boolean;
  dashboardUrl: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: "SUPER_ADMIN" | "EVENT_ORGANIZER" | "EVENT_HOST" | "GUEST" | null;
};

function roleToDashboard(role: string | null | undefined): string {
  if (role === "SUPER_ADMIN") return "/admin";
  if (role === "EVENT_ORGANIZER") return "/dashboard";
  if (role === "EVENT_HOST") return "/welcome";
  return "/welcome";
}

export async function getLandingUserContext(): Promise<LandingUserContext> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { isLoggedIn: false, dashboardUrl: "/login", fullName: null, email: null, avatarUrl: null, role: null };
    }

    let role = (user.user_metadata?.role as LandingUserContext["role"]) ?? null;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, full_name: true, avatar_url: true },
      });
      if (dbUser?.role) role = dbUser.role;

      return {
        isLoggedIn: true,
        dashboardUrl: roleToDashboard(role),
        fullName: dbUser?.full_name ?? user.user_metadata?.full_name ?? user.email ?? null,
        email: user.email ?? null,
        avatarUrl: dbUser?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
        role,
      };
    } catch {
      return {
        isLoggedIn: true,
        dashboardUrl: roleToDashboard(role),
        fullName: user.user_metadata?.full_name ?? user.email ?? null,
        email: user.email ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
        role,
      };
    }
  } catch {
    return { isLoggedIn: false, dashboardUrl: "/login", fullName: null, email: null, avatarUrl: null, role: null };
  }
}
