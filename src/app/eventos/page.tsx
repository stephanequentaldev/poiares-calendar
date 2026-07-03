import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarX } from "lucide-react";
import { SearchFilters } from "@/components/search-filters";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { getPublicEvents, getCategories } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Consulte a lista completa de eventos aprovados no Município de Vila Nova de Poiares.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; categoria?: string; page?: string }>;
}

export default async function EventosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ events, totalPages, total }, categories] = await Promise.all([
    getPublicEvents({ search: params.q, categorySlug: params.categoria, page }),
    getCategories(),
  ]);

  function pageHref(p: number) {
    const usp = new URLSearchParams();
    if (params.q) usp.set("q", params.q);
    if (params.categoria) usp.set("categoria", params.categoria);
    usp.set("page", String(p));
    return `/eventos?${usp.toString()}`;
  }

  return (
    <div className="container-page py-10 animate-fade-in">
      <h1 className="text-3xl font-semibold mb-2">Eventos</h1>
      <p className="text-muted-foreground mb-6">{total} evento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</p>

      <div className="mb-8">
        <SearchFilters categories={categories} />
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <CalendarX className="h-10 w-10" />
          <p>Não foram encontrados eventos com os filtros selecionados.</p>
          <Button asChild variant="outline">
            <Link href="/eventos">Limpar filtros</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Paginação">
              <Button asChild variant="outline" size="icon" disabled={page <= 1}>
                <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
                  <ChevronLeft />
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                Página {page} de {totalPages}
              </span>
              <Button asChild variant="outline" size="icon" disabled={page >= totalPages}>
                <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages}>
                  <ChevronRight />
                </Link>
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
