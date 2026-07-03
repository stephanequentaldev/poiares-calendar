import { NextResponse } from "next/server";
import { createEvent } from "ics";
import { getEventBySlug } from "@/lib/data/events";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  const [year, month, day] = event.event_date.split("-").map(Number);
  const [startHour, startMinute] = event.start_time.split(":").map(Number);

  let durationHours = 2;
  let durationMinutes = 0;
  if (event.end_time) {
    const [endHour, endMinute] = event.end_time.split(":").map(Number);
    const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    if (totalMinutes > 0) {
      durationHours = Math.floor(totalMinutes / 60);
      durationMinutes = totalMinutes % 60;
    }
  }

  const { error, value } = createEvent({
    title: event.title,
    description: event.description || undefined,
    location: [event.location_name, event.address].filter(Boolean).join(", "),
    start: [year, month, day, startHour, startMinute],
    duration: { hours: durationHours, minutes: durationMinutes },
  });

  if (error || !value) {
    return NextResponse.json({ error: "Não foi possível gerar o ficheiro" }, { status: 500 });
  }

  return new NextResponse(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
