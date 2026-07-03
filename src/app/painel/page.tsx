import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyEventCard } from "@/components/my-event-card";
import { getCurrentUser } from "@/lib/auth";
import { getUserEvents } from "@/lib/data/events";

export const metadata: Metadata = { title: "O meu painel" };

export default async function PainelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const events = await getUserEvents(user.id);

  return (
    <div className="container-page py-10 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Os meus eventos</h1>
          <p className="text-muted-foreground">Consulte e gira os eventos que submeteu.</p>
        </div>
        <Button asChild>
          <Link href="/painel/novo">
            <Plus /> Criar evento
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <CalendarX className="h-10 w-10" />
          <p>Ainda não submeteu nenhum evento.</p>
          <Button asChild>
            <Link href="/painel/novo">Criar o meu primeiro evento</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <MyEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
