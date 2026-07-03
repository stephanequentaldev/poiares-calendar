import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://calendario.cm-vilanovadepoiares.pt";
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("slug, updated_at")
    .eq("status", "aprovado");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/eventos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/calendario`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/melhorias`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((event) => ({
    url: `${siteUrl}/eventos/${event.slug}`,
    lastModified: event.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...eventRoutes];
}
