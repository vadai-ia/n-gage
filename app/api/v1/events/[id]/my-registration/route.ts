import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const registration = await prisma.eventRegistration.findUnique({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    select: {
      selfie_url: true,
      display_name: true,
      bio: true,
      table_number: true,
      super_like_used: true,
      photos_taken: true,
      search_started_at: true,
    },
  });

  return NextResponse.json({ registration });
}
