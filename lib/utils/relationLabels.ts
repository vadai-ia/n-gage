/**
 * Mapea los valores de `relation_type` del enum a labels cortos
 * que se muestran en las tarjetas del swipe, likes, y matches.
 *
 * Colapsa 6 valores a 3 labels maximo para UX mas limpia en bodas.
 */
export const RELATION_LABELS: Record<string, string> = {
  friend_bride: "Team Novia",
  family_bride: "Team Novia",
  friend_groom: "Team Novio",
  family_groom: "Team Novio",
  coworker: "Invitad@",
  other: "Invitad@",
};

export function getRelationLabel(
  relation: string | null | undefined
): string | null {
  if (!relation) return null;
  return RELATION_LABELS[relation] ?? null;
}
