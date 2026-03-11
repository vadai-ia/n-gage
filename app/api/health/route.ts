import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [userCount, eventCount] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "MISSING",
      supabase_anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "MISSING",
      supabase_service: process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured" : "MISSING",
      database_url: process.env.DATABASE_URL ? "configured" : "MISSING",
      app_url: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
      counts: { users: userCount, events: eventCount },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      status: "error",
      database: "disconnected",
      error: message,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "MISSING",
      database_url: process.env.DATABASE_URL ? "configured" : "MISSING",
    });
  }
}
