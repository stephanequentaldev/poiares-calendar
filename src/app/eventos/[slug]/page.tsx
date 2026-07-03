import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, User, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventActions } from "@/components/event-actions";
import { getEventBySlug } from "@/lib/data/events";
import { formatDate, formatTime } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento não encontrado" };

  return {
    title: event.title,
    description: event.description?.slice(0, 160) || `${event.title} — ${event.location_name}`,
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160) || event.location_name,
      images: event.poster_url ? [event.poster_url] : undefined,
    },
  };
}

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  aprovado: { label: "Aprovado", variant: "success" },
  pendente: { label: "Pendente de aprovação", variant: "warning" },
  rejeitado: { label: "Rejeitado", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "secondary" },
  terminado: { label: "Terminado", variant: "secondary" },
};

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const CategoryIcon = getCategoryIcon(event.category.icon);
  const status = statusLabels[event.status];
  const mapQuery = event.address ? `${event.location_name}, ${event.address}` : event.location_name;

  return (
    <div className="container-page py-10 animate-fade-in max-w-4xl">
      <Link href="/eventos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar aos eventos
      </Link>

      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-secondary mb-6">
        {event.poster_url ? (
          <Image
            src={event.poster_url}
            alt={`Cartaz do evento ${event.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CategoryIcon className="h-16 w-16 text-primary/30" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="secondary" className="gap-1">
          <CategoryIcon className="h-3 w-3" /> {event.category.name}
        </Badge>
        {event.status !== "aprovado" && status && <Badge variant={status.variant}>{status.label}</Badge>}
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold mb-6 leading-tight">{event.title}</h1>

      <div className="grid gap-3 sm:grid-cols-2 mb-8 text-foreground">
        <div className="flex items-center gap-3 rounded-xl border border-border p-4">
          <CalendarDays className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Data</p>
            <p className="font-medium">{formatDate(event.event_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border p-4">
          <Clock className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Hora</p>
            <p className="font-medium">
              {formatTime(event.start_time)}
              {event.end_time && ` – ${formatTime(event.end_time)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border p-4 sm:col-span-2">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Local</p>
            <p className="font-medium">{event.location_name}</p>
            {event.address && <p className="text-sm text-muted-foreground">{event.address}</p>}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <EventActions event={event} />
      </div>

      {event.description && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Descrição</h2>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      )}

      {event.gallery && event.gallery.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Galeria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {event.gallery.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                <Image src={img.image_url} alt={`Imagem da galeria de ${event.title}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {event.address && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Localização</h2>
          <div className="rounded-2xl overflow-hidden border border-border aspect-[16/9]">
            <iframe
              title={`Mapa de ${event.location_name}`}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-6">
        <User className="h-4 w-4" /> Evento submetido através da plataforma do Município
      </div>
    </div>
  );
}
