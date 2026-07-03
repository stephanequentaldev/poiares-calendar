"use client";

import { useState } from "react";
import { Share2, CalendarPlus, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventWithRelations } from "@/types/database";

function buildGoogleCalendarUrl(event: EventWithRelations) {
  const start = `${event.event_date.replace(/-/g, "")}T${event.start_time.replace(/:/g, "").slice(0, 6)}`;
  const endDate = event.end_date || event.event_date;
  const endTime = event.end_time || event.start_time;
  const end = `${endDate.replace(/-/g, "")}T${endTime.replace(/:/g, "").slice(0, 6)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || "",
    location: [event.location_name, event.address].filter(Boolean).join(", "),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventActions({ event }: { event: EventWithRelations }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        // utilizador cancelou a partilha; sem ação necessária
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={handleShare}>
        {copied ? <Check className="text-primary" /> : <Share2 />}
        {copied ? "Ligação copiada" : "Partilhar"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <CalendarPlus /> Adicionar ao calendário
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
              Google Calendar
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/eventos/${event.slug}/ics`} download>
              Ficheiro .ics (Outlook, Apple)
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CopyLinkFallbackIcon() {
  return <Copy className="hidden" />;
}
