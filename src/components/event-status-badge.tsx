import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/types/database";

const STATUS_CONFIG: Record<EventStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  aprovado: { label: "Aprovado", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  rejeitado: { label: "Rejeitado", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "secondary" },
  terminado: { label: "Terminado", variant: "secondary" },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
