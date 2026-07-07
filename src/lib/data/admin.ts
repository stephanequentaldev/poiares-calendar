import { createClient } from "@/lib/supabase/server";
import type { EventWithRelations, EventStatus, Profile, Suggestion } from "@/types/database";

const EVENT_SELECT = "*, category:categories(*)";

export async function getAdminStats() {
  const supabase = await createClient();

  const [pending, approved, rejected, finished, users, total, unreadSuggestions] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "aprovado"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "rejeitado"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "terminado"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("suggestions").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);

  return {
    pending: pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
    finished: finished.count ?? 0,
    users: users.count ?? 0,
    total: total.count ?? 0,
    unreadSuggestions: unreadSuggestions.count ?? 0,
  };
}

export async function getRecentEvents(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as EventWithRelations[];
}

export async function getRecentUsers(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Profile[];
}

export async function getAdminEvents(status?: EventStatus) {
  const supabase = await createClient();
  let query = supabase.from("events").select(EVENT_SELECT).order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as EventWithRelations[];
}

export async function getAllUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getSuggestions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suggestions")
    .select("*")
    .order("is_read", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Suggestion[];
}
