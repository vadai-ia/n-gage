import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserToDB } from "@/lib/auth/sync-user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync user to our database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await syncUserToDB(user);
        } catch (e) {
          console.error("Error syncing user to DB:", e);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
