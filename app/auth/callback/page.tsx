"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function roleToPath(role: string): string {
  if (role === "SUPER_ADMIN") return "/admin";
  if (role === "EVENT_ORGANIZER") return "/dashboard";
  return "/welcome";
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
      router.replace("/login?error=auth");
      return;
    }

    const supabase = createClient();

    // Exchange the code CLIENT-SIDE — same client that stored the PKCE verifier
    supabase.auth.exchangeCodeForSession(code).then(async ({ error: exchangeError }) => {
      if (exchangeError) {
        console.error("[callback] exchangeCodeForSession failed:", exchangeError.message);
        setError(exchangeError.message);
        setTimeout(() => router.replace(`/login?error=auth&reason=${encodeURIComponent(exchangeError.message)}`), 1500);
        return;
      }

      // Sync user to DB and get real role
      try {
        const res = await fetch("/api/v1/auth/sync", { method: "POST" });
        const data = await res.json();
        const dbRole: string = data.user?.role ?? "GUEST";

        // Write role back to Supabase metadata so middleware can read it
        if (data.user?.role) {
          await supabase.auth.updateUser({ data: { role: dbRole } });
        }

        // Redirect: specific path takes priority, otherwise use role
        const destination = next === "/" ? roleToPath(dbRole) : next;
        window.location.href = destination;
      } catch {
        // Fallback: use next or welcome
        window.location.href = next === "/" ? "/welcome" : next;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "#07070F" }}
    >
      {error ? (
        <p className="text-sm text-center max-w-xs" style={{ color: "#FF2D78" }}>
          {error}
        </p>
      ) : (
        <>
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "#8585A8" }}>Autenticando...</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}>
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#FF2D78", borderTopColor: "transparent" }}
          />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
