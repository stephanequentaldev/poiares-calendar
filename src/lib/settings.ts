import { createClient } from "@/lib/supabase/server";

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");

  const settings: Record<string, string | null> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return {
    logoUrl: settings.logo_url || "/branding/logo-fallback.png",
    siteName: settings.site_name || "Calendário Municipal de Vila Nova de Poiares",
    contactEmail: settings.contact_email || "geral@cm-vilanovadepoiares.pt",
  };
}
