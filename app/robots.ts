import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.ngage.com.mx";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dashboard/", "/host/", "/event/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
