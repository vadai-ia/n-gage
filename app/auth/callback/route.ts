import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function roleToPath(role: string): string {
  if (role === "SUPER_ADMIN") return "/admin";
  if (role === "EVENT_ORGANIZER") return "/dashboard";
  return "/welcome";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user to determine redirect
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Sync to DB
        let dbRole = "GUEST";
        try {
          const dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email ?? "",
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            },
            create: {
              id: user.id,
              email: user.email ?? "",
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              role: "GUEST",
            },
          });
          dbRole = dbUser.role;

          // Sync role to Supabase metadata
          if (dbUser.role !== user.user_metadata?.role) {
            await supabase.auth.updateUser({ data: { role: dbUser.role } });
          }
        } catch {
          // Non-blocking — user might already exist
        }

        const destination = next === "/" ? roleToPath(dbRole) : next;
        return NextResponse.redirect(new URL(destination, origin));
      }
    }
  }

  // Fallback: something went wrong
  return NextResponse.redirect(
    new URL(`/login?error=auth&reason=${encodeURIComponent("OAuth code could not be exchanged.")}`, origin)
  );
}
