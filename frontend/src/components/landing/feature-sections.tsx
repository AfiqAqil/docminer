"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Mini-illustrations for each step                                   */
/* ------------------------------------------------------------------ */

function UploadVisual() {
  const types = ["PDF", "DOCX", "XLSX", "PPTX", "HTML", "IMG"];
  return (
    <div className="relative h-[140px] flex items-center justify-center">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, oklch(0.55 0.25 285 / 12%), transparent 70%)",
        }}
      />
      {/* File type badges */}
      <div className="relative flex flex-wrap items-center justify-center gap-2 max-w-[200px]">
        {types.map((t, i) => (
          <motion.div
            key={t}
            className="px-2.5 py-1 rounded-md border border-white/[0.06] bg-white/[0.02] font-mono text-[10px] tracking-wider text-muted-foreground/40"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
          >
            {t}
          </motion.div>
        ))}
      </div>
      {/* Drop zone border hint */}
      <div className="absolute inset-3 rounded-lg border border-dashed border-white/[0.04]" />
    </div>
  );
}

function SchemaVisual() {
  const fields = [
    { name: "vendor", type: "string" },
    { name: "amount", type: "number" },
    { name: "date", type: "date" },
    { name: "status", type: "enum" },
  ];
  return (
    <div className="relative h-[140px] flex items-center justify-center">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, oklch(0.55 0.25 285 / 12%), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-[200px] space-y-1.5">
        {/* Schema bracket */}
        <div className="font-mono text-[10px] text-primary/30 tracking-wider pl-1">
          {"schema {"}
        </div>
        {fields.map((f, i) => (
          <motion.div
            key={f.name}
            className="flex items-center gap-2 pl-5"
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.45 + i * 0.08 }}
          >
            <span className="font-mono text-[10px] text-foreground/50 tracking-wide">
              {f.name}
            </span>
            <span className="flex-1 border-b border-dotted border-white/[0.04]" />
            <span className="font-mono text-[10px] text-primary/35 tracking-wide">
              {f.type}
            </span>
          </motion.div>
        ))}
        <div className="font-mono text-[10px] text-primary/30 tracking-wider pl-1">
          {"}"}
        </div>
      </div>
    </div>
  );
}

function ExtractVisual() {
  const output = [
    { key: "vendor", value: '"Acme Corp"', color: "text-foreground/50" },
    { key: "amount", value: "4250.00", color: "text-foreground/50" },
    { key: "date", value: '"2026-03-19"', color: "text-foreground/50" },
    { key: "status", value: '"approved"', color: "text-success/70" },
  ];
  return (
    <div className="relative h-[140px] flex items-center justify-center">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, oklch(0.627 0.194 149 / 10%), transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-[200px] space-y-1.5">
        <div className="font-mono text-[10px] text-success/30 tracking-wider pl-1">
          {"output {"}
        </div>
        {output.map((o, i) => (
          <motion.div
            key={o.key}
            className="flex items-center gap-2 pl-5"
            initial={{ opacity: 0, x: 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.45 + i * 0.08 }}
          >
            <span className="font-mono text-[10px] text-muted-foreground/35 tracking-wide">
              {o.key}:
            </span>
            <span className={`font-mono text-[10px] tracking-wide ${o.color}`}>
              {o.value}
            </span>
          </motion.div>
        ))}
        <div className="font-mono text-[10px] text-success/30 tracking-wider pl-1">
          {"}"}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Steps data                                                         */
/* ------------------------------------------------------------------ */

const steps = [
  {
    number: "01",
    title: "Upload",
    description:
      "Drop any document — PDF, DOCX, spreadsheet, presentation, or image. Docling converts it to clean markdown.",
    visual: UploadVisual,
  },
  {
    number: "02",
    title: "Define",
    description:
      "Create a typed schema for the fields you need. Name, type, constraints — reuse across documents.",
    visual: SchemaVisual,
  },
  {
    number: "03",
    title: "Extract",
    description:
      "AI reads your document against the schema. Structured data out — any LLM provider via litellm.",
    visual: ExtractVisual,
  },
];

/* ------------------------------------------------------------------ */
/*  Flow connector between cards                                       */
/* ------------------------------------------------------------------ */

function FlowConnector({ index }: { index: number }) {
  return (
    <motion.div
      className="hidden md:flex items-center justify-center -mx-3 z-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
    >
      <div className="relative flex items-center">
        <div className="w-6 h-px bg-gradient-to-r from-white/[0.06] to-white/[0.03]" />
        <ArrowRight className="size-3 text-primary/25 -ml-0.5" />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                       */
/* ------------------------------------------------------------------ */

export function FeatureSections() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="features" className="py-24 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="h-px w-5 bg-primary/30" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary/40">
              Three steps
            </span>
            <span className="h-px w-5 bg-primary/30" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            How it works
          </h2>
        </motion.div>

        {/* Step cards with connectors */}
        <div className="flex flex-col md:flex-row items-stretch gap-5 md:gap-0">
          {steps.map((step, i) => {
            const Visual = step.visual;
            return (
              <div key={step.number} className="contents">
                {/* Card */}
                <motion.div
                  className="flex-1 group"
                  initial={{ opacity: 0, y: 18 }}
                  animate={
                    inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
                  }
                  transition={{
                    duration: 0.55,
                    ease: "easeOut",
                    delay: 0.2 + i * 0.12,
                  }}
                >
                  <div className="h-full rounded-xl border border-white/[0.05] bg-white/[0.015] overflow-hidden transition-colors hover:border-white/[0.08] hover:bg-white/[0.025]">
                    {/* Visual illustration */}
                    <Visual />

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

                    {/* Text content */}
                    <div className="p-5 pt-4">
                      <div className="flex items-baseline gap-2.5 mb-2.5">
                        <span className="font-mono text-[10px] text-primary/35 tracking-[0.15em]">
                          {step.number}
                        </span>
                        <h3 className="font-display text-[15px] font-semibold tracking-tight text-foreground/85">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[13px] text-muted-foreground/45 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Connector arrow */}
                {i < steps.length - 1 && <FlowConnector index={i} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
