"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface PageHeaderProps {
  title: string;
  overline?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, overline, children }: PageHeaderProps) {
  return (
    <motion.div
      className="mb-8"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {overline && (
        <div className="inline-flex items-center gap-2.5 mb-2">
          <span className="h-px w-5 bg-primary/40" />
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary/40">
            {overline}
          </span>
          <span className="h-px w-5 bg-primary/40" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </motion.div>
  );
}
