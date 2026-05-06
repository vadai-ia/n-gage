import type { Metadata } from "next";
import { getLandingUserContext } from "@/lib/landing/get-user-context";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { VariantProvider } from "@/components/marketing/VariantProvider";
import { PricingTabs } from "@/components/marketing/PricingTabs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planes y precios · N'GAGE",
  description:
    "Modelos de inversión por tipo de evento. Spark · Vibe · Luxe · Royal y cotización a la medida para festivales/corporativos.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ngage.com.mx"}/precios`,
  },
};

export default async function PreciosPage() {
  const user = await getLandingUserContext();
  return (
    <VariantProvider variant="general">
      <Navbar user={user} />
      <PricingTabs />
      <Footer />
    </VariantProvider>
  );
}
