import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      event_id: true,
      event: {
        select: {
          id: true,
          name: true,
          event_date: true,
          venue_name: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json({ registrations });
}
