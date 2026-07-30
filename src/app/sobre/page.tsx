import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Saiba mais sobre o Calendário de Eventos - Vila Nova de Poiares e como submeter eventos.",
};

export default async function SobrePage() {
  const { contactEmail } = await getSiteSettings();

  return (
    <div className="container-page py-14 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">Sobre a plataforma</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Objetivo</h2>
        <p className="text-foreground/90 leading-relaxed">
          O Calendário de Eventos de Vila Nova de Poiares foi criado para
          centralizar, num único local, todos os eventos culturais, desportivos, religiosos e
          recreativos que decorrem no concelho. O objetivo é facilitar o acesso à informação por
          parte de todos os cidadãos, associações e visitantes, promovendo a participação na vida
          coletiva da comunidade.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Quem gere a plataforma</h2>
        <p className="text-foreground/90 leading-relaxed">
          A plataforma é gerida pelos Bombeiros Voluntários de Vila Nova de Poiares. Todos os eventos
          submetidos por cidadãos e entidades são revistos pela equipa dos Bombeiros Voluntários antes de serem publicados,
          garantindo a qualidade e adequação da informação disponibilizada.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Como submeter um evento</h2>
        <ol className="space-y-3">
          {[
            "Crie uma conta gratuita ou inicie sessão.",
            "Aceda a \"Criar evento\" e preencha os dados: título, local, data, hora e categoria.",
            "Adicione, se possível, um cartaz e uma breve descrição.",
            "Submeta o evento — o estado inicial será \"Pendente\".",
            "A equipa dos Bombeiros Voluntários analisa e aprova ou rejeita o pedido.",
            "Após aprovação, o evento fica visível a todos os visitantes.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-foreground/90">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        Dúvidas ou contacto: <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
    </div>
  );
}
