"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <motion.div
      className="flex items-center justify-between mb-8"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </motion.div>
  );
}
