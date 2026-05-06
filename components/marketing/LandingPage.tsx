import { getLandingUserContext } from "@/lib/landing/get-user-context";
import type { Variant } from "@/lib/landing/variant";
import { CONTENT } from "@/lib/landing/variant";
import { VariantProvider } from "./VariantProvider";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Manifesto } from "./Manifesto";
import { HowItWorks } from "./HowItWorks";
import { UseCases } from "./UseCases";
import { BrandingShowcase } from "./BrandingShowcase";
import { PricingTeaser } from "./PricingTeaser";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";
import { PreFooter } from "./PreFooter";
import { ContactForm } from "./ContactForm";
import { Footer } from "./Footer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { CookieBanner } from "./CookieBanner";
import { ScrollFx } from "./ScrollFx";
import { CursorTrail } from "./CursorTrail";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ngage.com.mx";

/**
 * LandingPage — Componente shared usado por las 3 rutas (/ /bodas /eventos).
 *
 * Cada ruta:
 *   1. Define su propia metadata (SEO específico por variante).
 *   2. Llama <LandingPage variant="..." /> que aplica VariantProvider y orquesta
 *      todas las secciones.
 *
 * El VariantProvider aplica `data-variant` al <body>, lo que activa los tokens
 * CSS scopeados por variante en globals.css.
 */
export async function LandingPage({ variant }: { variant: Variant }) {
  const user = await getLandingUserContext();
  const c = CONTENT[variant];
  const path = variant === "general" ? "" : variant === "weddings" ? "/bodas" : "/eventos";
  const url = `${SITE_URL}${path || "/"}`;

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
    name: variant === "weddings" ? "N'GAGE Weddings" : variant === "events" ? "N'GAGE Events" : "N'GAGE",
    applicationCategory: variant === "events" ? "BusinessApplication" : "SocialNetworkingApplication",
    operatingSystem: "Web",
    description: c.seoDescription,
    url,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <VariantProvider variant={variant}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <ScrollFx />
      <CursorTrail />
      <Navbar user={user} />
      <main>
        <Hero />
        <Manifesto />
        <HowItWorks />
        <UseCases />
        <BrandingShowcase />
        <PricingTeaser />
        <Testimonials />
        <FAQ />
        <PreFooter />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CookieBanner />
    </VariantProvider>
  );
}
