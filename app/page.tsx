import type { Metadata } from "next";
import { getLandingUserContext } from "@/lib/landing/get-user-context";
import { Navbar } from "@/components/marketing/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { WhatIsNgage } from "@/components/marketing/WhatIsNgage";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { UseCases } from "@/components/marketing/UseCases";
import { BrandingShowcase } from "@/components/marketing/BrandingShowcase";
import { Benefits } from "@/components/marketing/Benefits";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Footer } from "@/components/marketing/Footer";
import { WhatsAppFloat } from "@/components/marketing/WhatsAppFloat";
import { CookieBanner } from "@/components/marketing/CookieBanner";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ngage.com.mx";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "N'GAGE — Conecta. Aquí y ahora.",
  description:
    "La plataforma de conexión social para eventos en vivo. Bodas, festivales, conciertos, corporativos, cruceros, graduaciones. Brandeable, efímera, inolvidable.",
  keywords: [
    "app eventos", "matching eventos", "networking eventos", "app boda",
    "app festival", "engagement evento", "plataforma eventos", "QR evento",
    "N'GAGE", "ngage", "conexion eventos", "matching social",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: "N'GAGE",
    title: "N'GAGE — Conecta. Aquí y ahora.",
    description:
      "Convierte cualquier evento en una experiencia de conexión real, efímera y memorable.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "N'GAGE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "N'GAGE — Conecta. Aquí y ahora.",
    description: "La plataforma de conexión social para eventos en vivo.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: SITE_URL },
};

export default async function LandingPage() {
  const user = await getLandingUserContext();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "N'GAGE",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    sameAs: [
      "https://instagram.com/ngage",
      "https://tiktok.com/@ngage",
      "https://linkedin.com/company/ngage",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hola@ngage.com.mx",
      availableLanguage: ["Spanish", "English"],
    },
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "N'GAGE",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", priceCurrency: "MXN", price: "0", description: "Cotización por evento" },
    description:
      "Plataforma de conexión social event-scoped para bodas, festivales, conciertos, eventos corporativos, deportivos, cruceros y más.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <Navbar user={user} />
      <main>
        <Hero />
        <WhatIsNgage />
        <HowItWorks />
        <UseCases />
        <BrandingShowcase />
        <Benefits />
        <ComparisonTable />
        <PricingTeaser />
        <Testimonials />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CookieBanner />
    </>
  );
}
