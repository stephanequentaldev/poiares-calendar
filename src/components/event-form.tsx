"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Category, EventWithRelations } from "@/types/database";

const schema = z
  .object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(150),
    location_name: z.string().min(2, "Indique o local").max(150),
    address: z.string().max(200).optional().or(z.literal("")),
    event_date: z.string().min(1, "Indique a data"),
    start_time: z.string().min(1, "Indique a hora de início"),
    end_time: z.string().optional().or(z.literal("")),
    category_id: z.string().min(1, "Selecione uma categoria"),
    description: z.string().max(5000).optional().or(z.literal("")),
  })
  .refine((data) => !data.end_time || data.end_time > data.start_time, {
    message: "A hora de fim deve ser posterior à hora de início",
    path: ["end_time"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  categories: Category[];
  userId: string;
  event?: EventWithRelations;
}

export function EventForm({ categories, userId, event }: Props) {
  const router = useRouter();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(event?.poster_url ?? null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          title: event.title,
          location_name: event.location_name,
          address: event.address ?? "",
          event_date: event.event_date,
          start_time: event.start_time.slice(0, 5),
          end_time: event.end_time?.slice(0, 5) ?? "",
          category_id: event.category_id,
          description: event.description ?? "",
        }
      : { event_date: "", start_time: "" },
  });

  function handlePosterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setSubmitError("A imagem do cartaz não pode exceder 8MB.");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const supabase = createClient();

    try {
      let posterUrl = event?.poster_url ?? null;

      if (posterFile) {
        setUploading(true);
        const ext = posterFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(path, posterFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from("event-images").getPublicUrl(path);
        posterUrl = publicUrl.publicUrl;
        setUploading(false);
      }

      const payload = {
        title: values.title,
        location_name: values.location_name,
        address: values.address || null,
        event_date: values.event_date,
        start_time: values.start_time,
        end_time: values.end_time || null,
        category_id: values.category_id,
        description: values.description || null,
        poster_url: posterUrl,
      };

      if (event) {
        const { error } = await supabase.from("events").update(payload).eq("id", event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("events")
          .insert({ ...payload, created_by: userId, status: "pendente" });
        if (error) throw error;
      }

      router.push("/painel");
      router.refresh();
    } catch {
      setSubmitError("Não foi possível guardar o evento. Verifique os dados e tente novamente.");
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título *</Label>
        <Input id="title" {...register("title")} aria-required="true" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location_name">Local *</Label>
          <Input id="location_name" {...register("location_name")} aria-required="true" />
          {errors.location_name && <p className="text-sm text-destructive">{errors.location_name.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="address">Morada (opcional)</Label>
          <Input id="address" {...register("address")} placeholder="Para mostrar o mapa" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="event_date">Data *</Label>
          <Input id="event_date" type="date" {...register("event_date")} aria-required="true" />
          {errors.event_date && <p className="text-sm text-destructive">{errors.event_date.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="start_time">Hora de início *</Label>
          <Input id="start_time" type="time" {...register("start_time")} aria-required="true" />
          {errors.start_time && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="end_time">Hora de fim (opcional)</Label>
          <Input id="end_time" type="time" {...register("end_time")} />
          {errors.end_time && <p className="text-sm text-destructive">{errors.end_time.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category_id">Categoria *</Label>
        <Controller
          control={control}
          name="category_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="category_id" aria-required="true">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Textarea id="description" rows={6} {...register("description")} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Imagem do cartaz (opcional)</Label>
        {posterPreview ? (
          <div className="relative w-full max-w-xs aspect-[4/3] rounded-xl overflow-hidden border border-border">
            <Image src={posterPreview} alt="Pré-visualização do cartaz" fill className="object-cover" />
            <button
              type="button"
              onClick={() => { setPosterFile(null); setPosterPreview(null); }}
              className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow hover:bg-secondary"
              aria-label="Remover imagem"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 w-full max-w-xs aspect-[4/3] rounded-xl border-2 border-dashed border-border cursor-pointer hover:bg-secondary/50 transition-colors">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Carregar imagem</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePosterChange} />
          </label>
        )}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting || uploading}>
          {(isSubmitting || uploading) && <Loader2 className="animate-spin" />}
          {event ? "Guardar alterações" : "Submeter evento"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>

      {event?.status === "aprovado" && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Este evento já está aprovado. Ao guardar alterações, o estado voltará automaticamente
          para &quot;Pendente&quot; até nova aprovação.
        </p>
      )}
    </form>
  );
}
