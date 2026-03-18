"use client";

import { motion, useInView } from "framer-motion";
import { Braces, FileSearch, Sparkles } from "lucide-react";
import { useRef } from "react";
import { TiltCard } from "@/components/landing/tilt-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { staggerContainer, staggerItem } from "@/lib/motion";

const features = [
  {
    icon: FileSearch,
    title: "Smart Conversion",
    description:
      "Docling converts PDFs, DOCX, PPTX, XLSX, HTML, and images into clean markdown — ready for AI extraction.",
  },
  {
    icon: Braces,
    title: "Custom Schemas",
    description:
      "Define exactly what fields you want to extract. Create typed schemas and reuse them across documents.",
  },
  {
    icon: Sparkles,
    title: "LLM Extraction",
    description:
      "Powered by litellm — use any LLM provider to extract structured data matching your schema definition.",
  },
];

export function FeatureSections() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-4">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.h2
          variants={staggerItem}
          className="font-display text-2xl md:text-3xl font-bold text-center mb-12 tracking-tight"
        >
          How it works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <motion.div key={feature.title} variants={staggerItem}>
              <TiltCard>
                <Card className="h-full ring-1 ring-white/[0.06] card-hover">
                  <CardHeader className="items-center text-center">
                    <div className="rounded-xl p-3.5 mb-2 bg-primary/10 shadow-[var(--glow-md)]">
                      <feature.icon className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-base font-display">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
