import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecapAccess } from "@/lib/recap/access";
import { buildRecap } from "@/lib/recap/build-recap";
import { normalizeRecapCode } from "@/lib/recap/code";
import { recapImage } from "@/lib/recap/images";
import RecapGate from "@/components/recap/RecapGate";
import RecapExperience from "@/components/recap/RecapExperience";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string };
  searchParams: { code?: string | string[] };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const access = await getRecapAccess(params.slug);
  if (!access) return { title: "Recuerdos · N'GAGE", robots: { index: false, follow: false } };
  const cover = access.event.cover_image_url || access.event.event_photos[0];
  return {
    title: `${access.event.name} · Recuerdos N'GAGE`,
    description: "Todo lo que pasó en el evento: matches, momentos y fotos.",
    // Contiene nombres y fotos de invitados: nunca indexar
    robots: { index: false, follow: false },
    openGraph: cover ? { images: [recapImage.hero(cover)] } : undefined,
  };
}

export default async function RecapPage({ params, searchParams }: PageProps) {
  const queryCode = typeof searchParams.code === "string" ? normalizeRecapCode(searchParams.code) : null;
  const access = await getRecapAccess(params.slug, queryCode);
  if (!access) notFound();

  const { event } = access;
  if (!access.unlocked) {
    return (
      <RecapGate
        slug={event.unique_slug}
        eventName={event.name}
        eventDate={event.event_date.toISOString()}
        venue={[event.venue_name, event.venue_city].filter(Boolean).join(" · ") || null}
        cover={event.cover_image_url || event.event_photos[0] || null}
        invalidCode={!!queryCode}
      />
    );
  }

  const data = await buildRecap(event.id);
  if (!data) notFound();

  return <RecapExperience data={data} persistCode={queryCode} />;
}
