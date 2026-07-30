import type { Metadata } from "next";
import { SuggestionForm } from "@/components/suggestion-form";

export const metadata: Metadata = {
  title: "Melhorias",
  description: "Envie sugestões de melhoria para o Calendário de Eventos - Vila Nova de Poiares.",
};

export default function MelhoriasPage() {
  return (
    <div className="container-page py-14 animate-fade-in max-w-xl">
      <h1 className="text-3xl font-semibold mb-2">Melhorias</h1>
      <p className="text-muted-foreground mb-8">
        A sua opinião ajuda-nos a melhorar esta plataforma. Envie sugestões, reporte problemas ou
        partilhe ideias.
      </p>
      <SuggestionForm />
    </div>
  );
}
