import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/LandingPage";
import { CONTENT } from "@/lib/landing/variant";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ngage.com.mx";
const PAGE_URL = `${SITE_URL}/bodas`;
const c = CONTENT.weddings;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: c.seoTitle,
  description: c.seoDescription,
  keywords: [
    "app boda", "app para bodas", "boda interactiva", "wedding planner mexico",
    "boda con app", "matching boda", "app invitados boda", "save the date",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: PAGE_URL,
    siteName: "N'GAGE / Weddings",
    title: c.seoTitle,
    description: c.seoDescription,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "N'GAGE Weddings" }],
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

export default function BodasPage() {
  return <LandingPage variant="weddings" />;
}
