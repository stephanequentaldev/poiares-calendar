import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import type { EventWithRelations } from "@/types/database";

export function EventCard({ event }: { event: EventWithRelations }) {
  const CategoryIcon = getCategoryIcon(event.category.icon);

  return (
    <Link href={`/eventos/${event.slug}`} className="block group focus-visible:outline-none">
      <Card className="overflow-hidden h-full flex flex-col focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative aspect-[4/3] w-full bg-secondary overflow-hidden">
          {event.poster_url ? (
            <Image
              src={event.poster_url}
              alt={`Cartaz do evento ${event.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CategoryIcon className="h-12 w-12 text-primary/30" />
            </div>
          )}
          {event.is_featured && (
            <Badge className="absolute left-3 top-3 bg-white/95 border-none shadow-sm">
              <Star className="h-3 w-3 mr-1 fill-primary text-primary" /> Destaque
            </Badge>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <Badge variant="secondary" className="w-fit gap-1">
            <CategoryIcon className="h-3 w-3" /> {event.category.name}
          </Badge>
          <h3 className="font-semibold leading-snug line-clamp-2">{event.title}</h3>
          <div className="mt-auto space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" /> {formatDate(event.event_date)}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" /> {formatTime(event.start_time)}
            </p>
            <p className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {event.location_name}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
