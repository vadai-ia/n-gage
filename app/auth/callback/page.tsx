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
    const next = searchParams.get("next") ?? "/";
    const supabase = createClient();
    let handled = false;

    async function onSession() {
      if (handled) return;
      handled = true;

      try {
        const res = await fetch("/api/v1/auth/sync", { method: "POST" });
        const data = await res.json();
        const dbRole: string = data.user?.role ?? "GUEST";

        if (data.user?.role) {
          await supabase.auth.updateUser({ data: { role: dbRole } });
        }

        const destination = next === "/" ? roleToPath(dbRole) : next;
        window.location.href = destination;
      } catch {
        window.location.href = next === "/" ? "/welcome" : next;
      }
    }

    // createBrowserClient has detectSessionInUrl=true — it auto-processes ?code=
    // on initialization. We must NOT call exchangeCodeForSession manually (it would
    // fail because the client already consumed the code + removed the verifier).
    // Instead, subscribe to auth state changes and wait for SIGNED_IN / INITIAL_SESSION.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
          await onSession();
        }
      }
    );

    // Also check immediately in case _initialize() already completed before subscribe
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onSession();
    });

    // Timeout: if no session after 10 s, something went wrong
    const timeout = setTimeout(() => {
      if (!handled) {
        const code = searchParams.get("code");
        const reason = code
          ? "OAuth code could not be exchanged. Try again."
          : "No OAuth code received.";
        setError(reason);
        setTimeout(
          () =>
            router.replace(
              `/login?error=auth&reason=${encodeURIComponent(reason)}`
            ),
          1500
        );
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
