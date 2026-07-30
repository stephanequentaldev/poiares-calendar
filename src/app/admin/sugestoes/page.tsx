import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SuggestionAdminCard } from "@/components/suggestion-admin-card";
import { getCurrentUser } from "@/lib/auth";
import { getSuggestions } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Sugestões" };

export default async function AdminSugestoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile.is_admin) redirect("/");

  const suggestions = await getSuggestions();

  return (
    <div className="container-page py-10 animate-fade-in">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="text-3xl font-semibold mb-2">Sugestões</h1>
      <p className="text-muted-foreground mb-8">
        {suggestions.length} sugestão{suggestions.length !== 1 ? "ões" : ""} enviada{suggestions.length !== 1 ? "s" : ""} na página Melhorias.
      </p>

      {suggestions.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">Ainda não existem sugestões.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {suggestions.map((suggestion) => (
            <SuggestionAdminCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  );
}