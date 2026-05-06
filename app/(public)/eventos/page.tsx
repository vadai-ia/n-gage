import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/LandingPage";
import { CONTENT } from "@/lib/landing/variant";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ngage.com.mx";
const PAGE_URL = `${SITE_URL}/eventos`;
const c = CONTENT.events;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: c.seoTitle,
  description: c.seoDescription,
  keywords: [
    "networking eventos", "app evento corporativo", "festival app",
    "matching profesional", "ROI evento", "engagement corporativo",
    "app conferencia", "white label evento",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: PAGE_URL,
    siteName: "N'GAGE / Events",
    title: c.seoTitle,
    description: c.seoDescription,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "N'GAGE Events" }],
  },
  twitter: {
    card: "summary_large_image",
    title: c.seoTitle,
    description: c.seoDescription,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: PAGE_URL,
    languages: { "es-MX": PAGE_URL },
  },
};

export default function EventosPage() {
  return <LandingPage variant="events" />;
}
