import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getEventById } from "@/lib/data/events";

export const metadata: Metadata = { title: "Editar evento" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEventoPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [event, categories] = await Promise.all([getEventById(id), getCategories()]);

  if (!event) notFound();
  if (event.created_by !== user.id && !user.profile.is_admin) notFound();

  return (
    <div className="container-page py-10 animate-fade-in max-w-2xl">
      <h1 className="text-3xl font-semibold mb-2">Editar evento</h1>
      <p className="text-muted-foreground mb-8">Atualize os dados do seu evento.</p>
      <EventForm categories={categories} userId={user.id} event={event} />
    </div>
  );
}
