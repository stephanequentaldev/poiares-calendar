import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://calendario.cm-vilanovadepoiares.pt";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Calendário Municipal | Vila Nova de Poiares",
    template: "%s | Calendário Municipal de Vila Nova de Poiares",
  },
  description:
    "Consulte todos os eventos, festas populares, concertos, feiras e atividades culturais do Município de Vila Nova de Poiares.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "Calendário Municipal de Vila Nova de Poiares",
    title: "Calendário Municipal de Vila Nova de Poiares",
    description:
      "Consulte todos os eventos, festas populares, concertos, feiras e atividades culturais do município.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:text-white focus:px-4 focus:py-2"
        >
          Saltar para o conteúdo principal
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
