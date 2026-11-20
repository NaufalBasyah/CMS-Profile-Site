import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={status === "New" ? "warning" : status === "Replied" ? "success" : "secondary"}>{status}</Badge>;
}
