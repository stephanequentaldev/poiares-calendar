import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/data/events";

export const metadata: Metadata = { title: "Criar evento" };

export default async function NovoEventoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const categories = await getCategories();

  return (
    <div className="container-page py-10 animate-fade-in max-w-2xl">
      <h1 className="text-3xl font-semibold mb-2">Criar evento</h1>
      <p className="text-muted-foreground mb-8">
        Preencha os dados abaixo. O evento ficará com o estado &quot;Pendente&quot; até ser
        aprovado pela equipa municipal.
      </p>
      <EventForm categories={categories} userId={user.id} />
    </div>
  );
}
