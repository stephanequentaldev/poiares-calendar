import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Iniciar sessão" };

export default function LoginPage() {
  return (
    <div className="container-page py-16 max-w-md mx-auto animate-fade-in">
      <h1 className="text-2xl font-semibold mb-1 text-center">Iniciar sessão</h1>
      <p className="text-muted-foreground text-center mb-8">Aceda à sua conta para submeter eventos.</p>
      <div className="rounded-2xl border border-border p-6 sm:p-8">
        <LoginForm />
      </div>
    </div>
  );
}
