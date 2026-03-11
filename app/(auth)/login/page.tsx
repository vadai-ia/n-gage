"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam === "auth" ? "Error de autenticación. Intenta de nuevo." : "");

  function roleToPath(role: string): string {
    if (role === "SUPER_ADMIN")     return "/admin";
    if (role === "EVENT_ORGANIZER") return "/dashboard";
    return "/welcome";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // Sync user to DB and use the returned role to redirect directly
    try {
      const res = await fetch("/api/v1/auth/sync", { method: "POST" });
      const data = await res.json();
      const role: string = data.user?.role ?? "GUEST";
      const destination = redirectTo !== "/" ? redirectTo : roleToPath(role);
      router.push(destination);
    } catch {
      router.push(redirectTo);
    }
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (oauthError) setError("Error al conectar con Google: " + oauthError.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "#07070F" }}>
      {/* Ambient orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 60%)" }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,47,190,0.05) 0%, transparent 60%)" }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-black tracking-tight mb-1.5"
            style={{
              background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            N&apos;GAGE
          </h1>
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "#44445A" }}>
            Conecta en el momento
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: "rgba(15,15,26,0.8)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h2 className="text-lg font-bold mb-6" style={{ color: "#F0F0FF" }}>Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8585A8" }}>
                Correo electrónico
              </label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com" required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F0F0FF",
                }}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8585A8" }}>
                Contraseña
              </label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F0F0FF",
                }}
              />
            </div>

            {error && (
              <p className="text-xs text-center py-1.5 rounded-lg" style={{ color: "#FF2D78", background: "rgba(255,45,120,0.06)" }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #FF2D78, #7B2FBE)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(255,45,120,0.25)",
              }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#44445A" }}>o</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F0F0FF",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <p className="text-center text-xs mt-5" style={{ color: "#44445A" }}>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "#FF2D78" }}>
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#07070F" }}></div>}>
      <LoginForm />
    </Suspense>
  );
}
