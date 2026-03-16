import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-amber-400 border-warning/20",
  },
  processing: {
    label: "Processing",
    className:
      "bg-primary/10 text-primary border-primary/20 animate-pulse status-processing",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
} as const;

type Status = keyof typeof statusConfig;

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
