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
      <div className="relative mb-5">
        {/* Radial glow */}
        <div
          className="absolute -inset-4 pointer-events-none opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, oklch(0.55 0.25 285 / 15%), transparent 70%)",
          }}
        />
        {/* Decorative rays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-gradient-to-t from-primary/15 to-transparent" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-px h-4 bg-gradient-to-b from-primary/15 to-transparent" />
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 h-px w-4 bg-gradient-to-l from-primary/15 to-transparent" />
          <div className="absolute top-1/2 -right-8 -translate-y-1/2 h-px w-4 bg-gradient-to-r from-primary/15 to-transparent" />
        </div>
        <div className="relative rounded-2xl bg-primary/10 p-5 shadow-[var(--glow-md)]">
          <Icon className="size-8 text-primary" />
        </div>
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
