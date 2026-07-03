import { createClient } from "@/lib/supabase/server";
import type { EventWithRelations } from "@/types/database";

const EVENT_SELECT = "*, category:categories(*)";

export interface EventFilters {
  search?: string;
  categorySlug?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export async function getPublicEvents(filters: EventFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("events")
    .select(EVENT_SELECT, { count: "exact" })
    .eq("status", "aprovado")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .range(from, to);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,location_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (filters.dateFrom) query = query.gte("event_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("event_date", filters.dateTo);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    events: (data ?? []) as unknown as EventWithRelations[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function getUpcomingEvents(limit = 6) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "aprovado")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as EventWithRelations[];
}

export async function getFeaturedEvents(limit = 4) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "aprovado")
    .eq("is_featured", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as EventWithRelations[];
}

export async function getEventsForMonth(year: number, month: number) {
  const supabase = await createClient();
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "aprovado")
    .gte("event_date", start)
    .lte("event_date", end)
    .order("event_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as EventWithRelations[];
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_SELECT}, gallery:event_gallery(*)`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const event = data as unknown as EventWithRelations;

  // Visitantes só podem ver eventos não aprovados se forem o autor ou admin (RLS já protege,
  // isto é apenas para UX: devolvemos null se não vier nada, o que já acontece via RLS).
  void userData;
  return event;
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_SELECT}, gallery:event_gallery(*)`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as EventWithRelations | null;
}

export async function getUserEvents(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as EventWithRelations[];
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}
