import { cn } from "@/lib/utils";

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/10 to-primary/20" />
      <div className="size-[3px] rounded-full bg-primary/25" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/10 to-primary/20" />
    </div>
  );
}
