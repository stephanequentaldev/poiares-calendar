import Image from "next/image";
import Link from "next/link";

export function Logo({ logoUrl, siteName }: { logoUrl: string; siteName: string }) {
  return (
    <Link href="/" className="flex items-center gap-3 shrink-0 min-h-11">
      <Image
        src={logoUrl}
        alt={`Brasão dos Bombeiros Voluntários de Vila Nova de Poiares`}
        width={44}
        height={44}
        className="h-11 w-11 object-contain"
        priority
      />
      <span className="hidden sm:block text-sm font-semibold leading-tight text-foreground">
        Calendário de Eventos
        <span className="block text-xs font-normal text-muted-foreground">
          {siteName.replace("Calendário de Eventos - ", "")}
        </span>
      </span>
    </Link>
  );
}
