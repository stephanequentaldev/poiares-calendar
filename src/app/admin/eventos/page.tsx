import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminEventCard } from "@/components/admin-event-card";
import { getCurrentUser } from "@/lib/auth";
import { getAdminEvents } from "@/lib/data/admin";
import type { EventStatus } from "@/types/database";

export const metadata: Metadata = { title: "Gestão de eventos" };

const STATUSES: { value: EventStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Aprovados" },
  { value: "rejeitado", label: "Rejeitados" },
  { value: "cancelado", label: "Cancelados" },
  { value: "terminado", label: "Terminados" },
];

interface PageProps {
  searchParams: Promise<{ estado?: string }>;
}

export default async function AdminEventosPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile.is_admin) redirect("/");

  const params = await searchParams;
  const status = (params.estado as EventStatus) || undefined;
  const events = await getAdminEvents(status);

  return (
    <div className="container-page py-10 animate-fade-in">
      <h1 className="text-3xl font-semibold mb-6">Gestão de eventos</h1>

      <Tabs value={status ?? "todos"} className="mb-6">
        <TabsList className="flex-wrap h-auto">
          {STATUSES.map((s) => (
            <TabsTrigger key={s.value} value={s.value} asChild>
              <Link href={s.value === "todos" ? "/admin/eventos" : `/admin/eventos?estado=${s.value}`}>
                {s.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {events.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">Não existem eventos neste estado.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <AdminEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
