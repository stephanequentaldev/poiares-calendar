"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Trash2, MailOpen, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Suggestion } from "@/types/database";

export function SuggestionAdminCard({ suggestion }: { suggestion: Suggestion }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleRead() {
    setLoading("read");
    const supabase = createClient();
    await supabase.from("suggestions").update({ is_read: !suggestion.is_read }).eq("id", suggestion.id);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete() {
    setLoading("delete");
    const supabase = createClient();
    await supabase.from("suggestions").delete().eq("id", suggestion.id);
    setLoading(null);
    router.refresh();
  }

  return (
    <Card className={`p-4 flex flex-col gap-3 ${!suggestion.is_read ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {suggestion.name || "Anónimo"}
          </span>
          {suggestion.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {suggestion.email}
            </span>
          )}
          <span>{formatDate(suggestion.created_at)}</span>
        </div>
        {!suggestion.is_read && (
          <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1">Não lida</span>
        )}
      </div>

      <p className="text-sm whitespace-pre-wrap">{suggestion.message}</p>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={toggleRead} disabled={!!loading}>
          {loading === "read" ? <Loader2 className="animate-spin" /> : <MailOpen />}
          {suggestion.is_read ? "Marcar como não lida" : "Marcar como lida"}
        </Button>
        <Button size="sm" variant="outline" className="text-destructive hover:bg-red-50" onClick={handleDelete} disabled={!!loading}>
          {loading === "delete" ? <Loader2 className="animate-spin" /> : <Trash2 />} Eliminar
        </Button>
      </div>
    </Card>
  );
}