"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatTime } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import type { EventWithRelations } from "@/types/database";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Props {
  year: number;
  month: number; // 1-12
  events: EventWithRelations[];
}

export function MonthCalendar({ year, month, events }: Props) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventWithRelations[]>();
    events.forEach((event) => {
      const list = map.get(event.event_date) ?? [];
      list.push(event);
      map.set(event.event_date, list);
    });
    return map;
  }, [events]);

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // 0 = segunda

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function goToMonth(offset: number) {
    let newMonth = month + offset;
    let newYear = year;
    if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    if (newMonth > 12) { newMonth = 1; newYear += 1; }
    router.push(`/calendario?ano=${newYear}&mes=${newMonth}`);
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const dayEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" onClick={() => goToMonth(-1)} aria-label="Mês anterior">
          <ChevronLeft />
        </Button>
        <h2 className="text-xl font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="outline" size="icon" onClick={() => goToMonth(1)} aria-label="Mês seguinte">
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEventsList = eventsByDay.get(iso) ?? [];
          const isToday = iso === todayIso;

          return (
            <button
              key={idx}
              onClick={() => dayEventsList.length > 0 && setSelectedDay(iso)}
              disabled={dayEventsList.length === 0}
              className={`min-h-20 sm:min-h-24 rounded-xl border p-1.5 sm:p-2 text-left flex flex-col gap-1 transition-colors
                ${isToday ? "border-primary bg-primary/5" : "border-border"}
                ${dayEventsList.length > 0 ? "hover:bg-secondary cursor-pointer" : "cursor-default"}
              `}
              aria-label={`Dia ${day}${dayEventsList.length ? `, ${dayEventsList.length} evento(s)` : ""}`}
            >
              <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</span>
              <div className="flex flex-col gap-0.5">
                {dayEventsList.slice(0, 2).map((ev) => (
                  <span key={ev.id} className="text-[10px] sm:text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate">
                    {ev.title}
                  </span>
                ))}
                {dayEventsList.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{dayEventsList.length - 2}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eventos em {selectedDay && new Date(selectedDay + "T00:00:00").toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {dayEvents.map((event) => {
              const Icon = getCategoryIcon(event.category.icon);
              return (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug}`}
                  className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-secondary transition-colors"
                >
                  <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium leading-snug">{event.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" /> {formatTime(event.start_time)}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {event.location_name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
