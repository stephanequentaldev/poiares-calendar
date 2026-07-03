"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Copy, Trash2, Loader2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { EventStatusBadge } from "@/components/event-status-badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatTime } from "@/lib/utils";
import type { EventWithRelations } from "@/types/database";

export function MyEventCard({ event }: { event: EventWithRelations }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", event.id);
    setLoading(false);
    setConfirmDelete(false);
    router.refresh();
  }

  async function handleDuplicate() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("events").insert({
      title: `${event.title} (cópia)`,
      location_name: event.location_name,
      address: event.address,
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time,
      category_id: event.category_id,
      description: event.description,
      poster_url: event.poster_url,
      created_by: event.created_by,
      status: "pendente",
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="flex flex-col sm:flex-row gap-4 p-4">
      <div className="relative w-full sm:w-32 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-secondary shrink-0">
        {event.poster_url && (
          <Image src={event.poster_url} alt="" fill className="object-cover" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <EventStatusBadge status={event.status} />
          <span className="text-xs text-muted-foreground">{event.category.name}</span>
        </div>
        <h3 className="font-semibold truncate">{event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {formatDate(event.event_date)} · {formatTime(event.start_time)} · {event.location_name}
        </p>
        {event.status === "rejeitado" && event.rejection_reason && (
          <p className="text-sm text-destructive mt-1">Motivo: {event.rejection_reason}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <Button asChild size="sm" variant="outline">
            <Link href={`/eventos/${event.slug}`}>
              <Eye /> Ver
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/painel/${event.id}/editar`}>
              <Pencil /> Editar
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={handleDuplicate} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Copy />} Duplicar
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
            <Trash2 /> Eliminar
          </Button>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar evento</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar &quot;{event.title}&quot;? Esta ação não pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
