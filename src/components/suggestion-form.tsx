"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Introduza um email válido").optional().or(z.literal("")),
  message: z
    .string()
    .min(5, "A mensagem deve ter pelo menos 5 caracteres")
    .max(3000, "A mensagem não pode exceder 3000 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function SuggestionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("suggestions").insert({
      name: values.name || null,
      email: values.email || null,
      message: values.message,
    });

    if (dbError) {
      setError("Não foi possível enviar a sua sugestão. Tente novamente.");
      return;
    }
    reset();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-12 rounded-2xl border border-border bg-secondary/40">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <p className="font-medium">Obrigado pela sua sugestão!</p>
        <p className="text-sm text-muted-foreground">A sua mensagem foi enviada com sucesso à equipa dos Bombeiros Voluntários.</p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Enviar outra sugestão
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome (opcional)</Label>
        <Input id="name" {...register("name")} placeholder="O seu nome" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email (opcional)</Label>
        <Input id="email" type="email" {...register("email")} placeholder="para respondermos, se necessário" />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Mensagem *</Label>
        <Textarea
          id="message"
          {...register("message")}
          placeholder="Partilhe a sua sugestão, ideia ou problema encontrado..."
          rows={6}
          aria-required="true"
        />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        <Send /> {isSubmitting ? "A enviar..." : "Enviar sugestão"}
      </Button>
    </form>
  );
}
