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
      relation_type: true,
      interests: true,
      gender: true,
      looking_for: true,
      super_like_used: true,
      photos_taken: true,
      search_started_at: true,
    },
  });

  return NextResponse.json({ registration });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const { selfie_url, display_name, bio, table_number, relation_type, interests, gender, looking_for } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};
  if (selfie_url !== undefined) updateData.selfie_url = selfie_url;
  if (display_name !== undefined) updateData.display_name = display_name?.trim() || null;
  if (bio !== undefined) updateData.bio = bio?.trim()?.slice(0, 160) || null;
  if (table_number !== undefined) updateData.table_number = table_number || null;
  if (relation_type !== undefined) updateData.relation_type = relation_type || null;
  if (interests !== undefined) updateData.interests = interests;
  if (gender !== undefined) updateData.gender = gender;
  if (looking_for !== undefined) updateData.looking_for = looking_for;

  const registration = await prisma.eventRegistration.update({
    where: { event_id_user_id: { event_id: eventId, user_id: user.id } },
    data: updateData,
  });

  return NextResponse.json({ registration });
}
