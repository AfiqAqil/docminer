import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  processing: {
    label: "Processing",
    className: "bg-primary/10 text-primary animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-400",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
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
