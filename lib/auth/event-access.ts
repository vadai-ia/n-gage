import { prisma } from "@/lib/prisma";

export type EventRole = "super_admin" | "organizer" | "host" | "guest";

/**
 * Determines the user's role relative to a specific event.
 * Returns the highest-privilege role the user has.
 */
export async function getUserEventRole(userId: string, eventId: string): Promise<EventRole> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "SUPER_ADMIN") return "super_admin";

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      organizer_id: true,
      hosts: { where: { user_id: userId }, select: { id: true } },
    },
  });

  if (!event) return "guest";
  if (event.organizer_id === userId) return "organizer";
  if (event.hosts.length > 0) return "host";

  return "guest";
}

/**
 * Checks if the event's social content (matches, likes, chats, profiles)
 * has expired for guest users. Returns false for privileged roles.
 *
 * Photos are NEVER affected by this — they have their own visibility logic.
 */
export async function isContentExpiredForUser(
  userId: string,
  eventId: string
): Promise<boolean> {
  const role = await getUserEventRole(userId, eventId);

  // Privileged roles never see expired content
  if (role !== "guest") return false;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { expiry_at: true, status: true, expiry_type: true },
  });

  if (!event) return true;

  // Never-expiring events
  if (event.expiry_type === "never") return false;

  // Check status
  if (event.status === "expired") return true;

  // Check expiry_at timestamp
  if (event.expiry_at && new Date() > new Date(event.expiry_at)) return true;

  return false;
}
