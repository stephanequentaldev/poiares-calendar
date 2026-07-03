"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, X, RotateCcw, Star, Trash2, Loader2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export function AdminEventCard({ event }: { event: EventWithRelations }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function updateStatus(status: string, extra: Record<string, unknown> = {}) {
    setLoading(status);
    const supabase = createClient();
    await supabase.from("events").update({ status, ...extra }).eq("id", event.id);
    setLoading(null);
    router.refresh();
  }

  async function toggleFeatured() {
    setLoading("destacar");
    const supabase = createClient();
    await supabase.from("events").update({ is_featured: !event.is_featured }).eq("id", event.id);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete() {
    setLoading("eliminar");
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", event.id);
    setLoading(null);
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <Card className="flex flex-col sm:flex-row gap-4 p-4">
      <div className="relative w-full sm:w-28 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-secondary shrink-0">
        {event.poster_url && <Image src={event.poster_url} alt="" fill className="object-cover" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <EventStatusBadge status={event.status} />
          {event.is_featured && <span className="text-xs text-primary flex items-center gap-1"><Star className="h-3 w-3 fill-primary" /> Destaque</span>}
        </div>
        <h3 className="font-semibold truncate">{event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {formatDate(event.event_date)} · {formatTime(event.start_time)} · {event.location_name}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {event.status === "pendente" && (
            <>
              <Button size="sm" onClick={() => updateStatus("aprovado")} disabled={!!loading}>
                {loading === "aprovado" ? <Loader2 className="animate-spin" /> : <Check />} Aprovar
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => setRejectOpen(true)} disabled={!!loading}>
                <X /> Rejeitar
              </Button>
            </>
          )}
          {event.status === "rejeitado" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("pendente")} disabled={!!loading}>
              {loading === "pendente" ? <Loader2 className="animate-spin" /> : <RotateCcw />} Restaurar
            </Button>
          )}
          {event.status === "aprovado" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("cancelado")} disabled={!!loading}>
              Cancelar evento
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={toggleFeatured} disabled={!!loading}>
            {loading === "destacar" ? <Loader2 className="animate-spin" /> : <Star className={event.is_featured ? "fill-primary text-primary" : ""} />}
            {event.is_featured ? "Remover destaque" : "Destacar"}
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/painel/${event.id}/editar`}>
              <Pencil /> Editar
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:bg-red-50" onClick={() => setDeleteOpen(true)} disabled={!!loading}>
            <Trash2 /> Eliminar
          </Button>
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar evento</DialogTitle>
            <DialogDescription>Indique, opcionalmente, o motivo da rejeição.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (opcional)" rows={4} />
          <div className="flex justify-end gap-3 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={async () => {
                await updateStatus("rejeitado", { rejection_reason: reason || null });
                setRejectOpen(false);
                setReason("");
              }}
              disabled={!!loading}
            >
              {loading === "rejeitado" && <Loader2 className="animate-spin" />} Confirmar rejeição
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
            <Button variant="destructive" onClick={handleDelete} disabled={!!loading}>
              {loading === "eliminar" && <Loader2 className="animate-spin" />} Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
