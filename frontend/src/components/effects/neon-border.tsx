import { cn } from "@/lib/utils";

interface NeonBorderProps {
  color?: "violet" | "success" | "destructive";
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

const glowMap = {
  violet: "shadow-[var(--glow-md)]",
  success: "shadow-[var(--glow-success-md)]",
  destructive: "shadow-[var(--glow-destructive-md)]",
} as const;

const borderMap = {
  violet: "border-primary/40",
  success: "border-emerald-500/40",
  destructive: "border-destructive/40",
} as const;

export function NeonBorder({
  color = "violet",
  pulse = false,
  children,
  className,
}: NeonBorderProps) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-shadow",
        glowMap[color],
        borderMap[color],
        pulse && "animate-pulse",
        className,
      )}
    >
      {children}
    </div>
  );
}
