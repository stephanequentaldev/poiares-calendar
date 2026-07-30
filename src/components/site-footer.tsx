import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export async function SiteFooter() {
  const { contactEmail } = await getSiteSettings();

  return (
    <footer className="mt-20 border-t border-border bg-secondary/60">
      <div className="container-page py-12 grid gap-10 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold mb-3">Calendário de Eventos</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Plataforma oficial de divulgação de eventos dos Bombeiros Voluntários de Vila Nova de Poiares.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Navegação</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/eventos" className="hover:text-primary">Eventos</Link></li>
            <li><Link href="/calendario" className="hover:text-primary">Calendário</Link></li>
            <li><Link href="/sobre" className="hover:text-primary">Sobre</Link></li>
            <li><Link href="/melhorias" className="hover:text-primary">Melhorias</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Contactos</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" /> Vila Nova de Poiares, Portugal
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary shrink-0" /> {contactEmail}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5">
        <p className="container-page text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bombeiros Voluntários de Vila Nova de Poiares. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
