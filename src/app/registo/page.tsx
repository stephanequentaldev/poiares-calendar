import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegistoPage() {
  return (
    <div className="container-page py-16 max-w-md mx-auto animate-fade-in">
      <h1 className="text-2xl font-semibold mb-1 text-center">Criar conta</h1>
      <p className="text-muted-foreground text-center mb-8">Registe-se gratuitamente para submeter eventos.</p>
      <div className="rounded-2xl border border-border p-6 sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
