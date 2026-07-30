import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://calendario.bvvilanovadepoiares.pt";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/painel", "/admin", "/login", "/registo"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
