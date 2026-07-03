import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getAllUsers } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Utilizadores" };

export default async function AdminUtilizadoresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile.is_admin) redirect("/");

  const users = await getAllUsers();

  return (
    <div className="container-page py-10 animate-fade-in">
      <h1 className="text-3xl font-semibold mb-2">Utilizadores</h1>
      <p className="text-muted-foreground mb-8">{users.length} utilizador{users.length !== 1 ? "es" : ""} registado{users.length !== 1 ? "s" : ""}</p>

      {/* Tabela — visível em ecrãs médios e maiores */}
      <div className="hidden md:block rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Registado em</th>
              <th className="px-4 py-3 font-medium">Função</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3">{u.full_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  {u.is_admin ? (
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" /> Administrador
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Cidadão</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cartões — visível em telemóvel */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border border-border p-4">
            <p className="font-medium">{u.full_name || "—"}</p>
            <p className="text-sm text-muted-foreground">{u.email}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{formatDate(u.created_at)}</span>
              {u.is_admin && (
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" /> Administrador
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
