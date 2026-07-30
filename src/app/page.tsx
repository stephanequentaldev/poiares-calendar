import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "@/components/search-filters";
import { EventCard } from "@/components/event-card";
import { getUpcomingEvents, getFeaturedEvents, getCategories } from "@/lib/data/events";

export default async function HomePage() {
  const [upcoming, featured, categories] = await Promise.all([
    getUpcomingEvents(8),
    getFeaturedEvents(4),
    getCategories(),
  ]);

  return (
    <div className="animate-fade-in">
      <section className="relative border-b border-border overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
        <Image
          src="/branding/hero-municipio.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-[#3a0f0d]/90" />

        <div className="relative container-page py-16 md:py-24 text-center flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 border border-white/20 px-4 py-1.5 text-sm text-primary font-medium">
            <CalendarDays className="h-4 w-4" /> Bombeiros Voluntários de Vila Nova de Poiares
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl leading-tight text-white">
            Todos os eventos, num só lugar
          </h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Festas, angariações de fundos, iniciativas de solidariedade e muito mais. Descubra o
            que vai acontecer e participe na vida da nossa associação.
          </p>
          <div className="w-full max-w-2xl">
            <SearchFilters categories={categories} />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Button asChild size="lg">
              <Link href="/calendario">
                <CalendarDays /> Ver calendário
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/eventos">
                Ver todos os eventos <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-page py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" /> Eventos em destaque
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Próximos eventos</h2>
          <Button asChild variant="ghost">
            <Link href="/eventos">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">
            Ainda não existem eventos aprovados. Volte a consultar brevemente.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="container-page pb-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Tem um evento para divulgar?</h2>
          <p className="text-primary-foreground/90 max-w-xl">
            Registe-se gratuitamente e submeta o seu evento. Após aprovação pela nossa equipa,
            fica disponível para toda a comunidade.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/painel/novo">Submeter evento</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
