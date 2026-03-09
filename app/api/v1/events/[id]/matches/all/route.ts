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

  // Solo hosts y organizer pueden ver todos los matches
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { organizer_id: user.id },
        { hosts: { some: { user_id: user.id } } },
      ],
    },
  });
  if (!event) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const matches = await prisma.eventMatch.findMany({
    where: { event_id: eventId },
    include: {
      user_a: { select: { id: true, full_name: true } },
      user_b: { select: { id: true, full_name: true } },
    },
    orderBy: { matched_at: "desc" },
  });

  // Enriquecer con selfies
  const enriched = await Promise.all(
    matches.map(async (m) => {
      const [regA, regB] = await Promise.all([
        prisma.eventRegistration.findUnique({
          where: { event_id_user_id: { event_id: eventId, user_id: m.user_a_id } },
          select: { selfie_url: true, table_number: true },
        }),
        prisma.eventRegistration.findUnique({
          where: { event_id_user_id: { event_id: eventId, user_id: m.user_b_id } },
          select: { selfie_url: true, table_number: true },
        }),
      ]);
      return { ...m, reg_a: regA, reg_b: regB };
    })
  );

  return NextResponse.json({ matches: enriched, total: enriched.length });
}
