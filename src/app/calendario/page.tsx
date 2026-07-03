import type { Metadata } from "next";
import { MonthCalendar } from "@/components/month-calendar";
import { getEventsForMonth } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Calendário",
  description: "Vista mensal de todos os eventos aprovados no Município de Vila Nova de Poiares.",
};

interface PageProps {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}

export default async function CalendarioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.ano) || now.getFullYear();
  const month = Number(params.mes) || now.getMonth() + 1;

  const events = await getEventsForMonth(year, month);

  return (
    <div className="container-page py-10 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-semibold mb-2">Calendário de Eventos</h1>
      <p className="text-muted-foreground mb-8">Clique num dia para ver os eventos agendados.</p>
      <MonthCalendar year={year} month={month} events={events} />
    </div>
  );
}
