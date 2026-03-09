import { prisma } from "@/lib/prisma";

/** Devuelve true si el userId pertenece a un SUPER_ADMIN */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "SUPER_ADMIN";
}
