"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-2xl bg-primary/10 p-5 mb-5 shadow-[var(--glow-md)]">
        <Icon className="size-8 text-primary" />
      </div>
      <h2 className="font-display text-lg font-medium mb-1.5">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={buttonVariants()}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </motion.div>
  );
}
