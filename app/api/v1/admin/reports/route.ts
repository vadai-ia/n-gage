import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "SUPER_ADMIN") return null;
  return user;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  type ReportStatus = "pending" | "resolved" | "dismissed";
  const validStatuses: ReportStatus[] = ["pending", "resolved", "dismissed"];
  const statusFilter = validStatuses.includes(status as ReportStatus)
    ? (status as ReportStatus)
    : undefined;

  const reports = await prisma.photoReport.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    orderBy: { created_at: "desc" },
    take: 50,
    include: {
      photo: { select: { id: true, cloudinary_url: true, thumbnail_url: true, is_visible: true } },
      reporter: { select: { full_name: true, email: true } },
    },
  });

  return NextResponse.json({ reports });
}

// PATCH — resolver reporte
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { reportId, action } = await req.json() as {
    reportId: string;
    action: "dismiss" | "remove_photo";
  };

  if (action === "dismiss") {
    await prisma.photoReport.update({
      where: { id: reportId },
      data: { status: "dismissed" },
    });
  } else if (action === "remove_photo") {
    const report = await prisma.photoReport.findUnique({ where: { id: reportId } });
    if (report) {
      await prisma.eventPhoto.update({
        where: { id: report.photo_id },
        data: { is_visible: false },
      });
      await prisma.photoReport.update({
        where: { id: reportId },
        data: { status: "resolved" },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
