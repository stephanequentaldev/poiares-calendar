import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, CalendarCheck2, Users, CalendarDays, ArrowRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/event-status-badge";
import { getCurrentUser } from "@/lib/auth";
import { getAdminStats, getRecentEvents, getRecentUsers } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Administração" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile.is_admin) redirect("/");

  const [stats, recentEvents, recentUsers] = await Promise.all([
    getAdminStats(),
    getRecentEvents(5),
    getRecentUsers(5),
  ]);

  const cards = [
    { label: "Pendentes", value: stats.pending, icon: Clock, href: "/admin/eventos?estado=pendente" },
    { label: "Aprovados", value: stats.approved, icon: CheckCircle2, href: "/admin/eventos?estado=aprovado" },
    { label: "Rejeitados", value: stats.rejected, icon: XCircle, href: "/admin/eventos?estado=rejeitado" },
    { label: "Terminados", value: stats.finished, icon: CalendarCheck2, href: "/admin/eventos?estado=terminado" },
    { label: "Utilizadores", value: stats.users, icon: Users, href: "/admin/utilizadores" },
    { label: "Total de eventos", value: stats.total, icon: CalendarDays, href: "/admin/eventos" },
    { label: "Sugestões por ler", value: stats.unreadSuggestions, icon: MessageSquare, href: "/admin/sugestoes" },
  ];

  return (
    <div className="container-page py-10 animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8">Painel de Administração</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="p-5 flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimos eventos</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/eventos">Ver todos <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-muted-foreground">{formatDate(event.event_date)}</p>
                </div>
                <EventStatusBadge status={event.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimos utilizadores</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/utilizadores">Ver todos <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.full_name || u.email}</p>
                  <p className="text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className="text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
