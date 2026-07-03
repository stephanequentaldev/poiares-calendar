import Link from "next/link";
import { CalendarDays, Menu, LogIn, Plus } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { UserMenu } from "@/components/user-menu";
import { getSiteSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/eventos", label: "Eventos" },
  { href: "/calendario", label: "Calendário" },
  { href: "/sobre", label: "Sobre" },
  { href: "/melhorias", label: "Melhorias" },
];

export async function SiteHeader() {
  const [{ logoUrl, siteName }, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Logo logoUrl={logoUrl} siteName={siteName} />

        <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="default">
                <Link href="/painel/novo">
                  <Plus /> Criar evento
                </Link>
              </Button>
              <UserMenu profile={user.profile} />
            </>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">
                <LogIn /> Iniciar sessão
              </Link>
            </Button>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="flex items-center gap-2 text-base mb-6">
                <CalendarDays className="h-5 w-5 text-primary" />
                Menu
              </SheetTitle>
              <nav className="flex flex-col gap-1" aria-label="Navegação móvel">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3.5 text-base font-medium hover:bg-secondary min-h-11"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                {user ? (
                  <>
                    <Button asChild>
                      <Link href="/painel/novo">
                        <Plus /> Criar evento
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/painel">O meu painel</Link>
                    </Button>
                    {user.profile.is_admin && (
                      <Button asChild variant="outline">
                        <Link href="/admin">Administração</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <Button asChild>
                    <Link href="/login">
                      <LogIn /> Iniciar sessão
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
