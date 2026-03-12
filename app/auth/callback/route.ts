import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserToDB } from "@/lib/auth/sync-user";

export const dynamic = "force-dynamic";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let dbRole: string = user.user_metadata?.role ?? "GUEST";

        // 1. Sync to DB — get the real role
        try {
          const dbUser = await syncUserToDB(user);
          dbRole = dbUser.role;

          // 2. Write DB role back into Supabase user_metadata so middleware
          //    can read it on subsequent requests (critical for Google OAuth)
          if (user.user_metadata?.role !== dbRole) {
            await supabase.auth.updateUser({ data: { role: dbRole } });
          }
        } catch (e) {
          console.error("Error syncing user to DB:", e);
          // Continue with fallback role from metadata
        }

        // 3. Redirect: use next if it's a specific path, otherwise go to role page
        const destination = next === "/" ? roleToPath(dbRole) : next;
        return NextResponse.redirect(`${origin}${destination}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
