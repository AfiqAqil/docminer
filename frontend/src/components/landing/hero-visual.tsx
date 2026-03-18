"use client";

import { motion } from "framer-motion";

const docLines = [0.82, 0.6, 0.9, 0.5, 0.78, 0.85, 0.42, 0.72, 0.65, 0.88];

const fields = [
  { key: "vendor", value: "Acme Corp" },
  { key: "amount", value: "$4,250.00" },
  { key: "date", value: "2026-03-19" },
  { key: "status", value: "approved", success: true },
];

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-7 pointer-events-none z-10"
      style={{
        background:
          "linear-gradient(to bottom, transparent 0%, oklch(0.55 0.25 285 / 20%) 40%, oklch(0.65 0.22 285 / 10%) 60%, transparent 100%)",
      }}
      animate={{ top: ["-8%", "108%"] }}
      transition={{
        duration: 2.8,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 1.5,
      }}
    />
  );
}

function ExtractorBeam() {
  return (
    <div className="relative h-px my-0.5">
      <div className="absolute inset-0 bg-white/[0.04]" />
      <motion.div
        className="absolute top-0 h-full w-2/5 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.55 0.25 285 / 50%), oklch(0.785 0.18 285 / 30%), transparent)",
          boxShadow: "0 0 12px oklch(0.55 0.25 285 / 20%)",
        }}
        animate={{ left: ["-40%", "100%"] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 0.8,
        }}
      />
    </div>
  );
}

function FieldRow({
  field,
  index,
}: {
  field: (typeof fields)[number];
  index: number;
}) {
  return (
    <motion.div
      className="flex items-center justify-between gap-4 py-1"
      initial={{ opacity: 0, x: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay: 1.0 + index * 0.18, ease: "easeOut" }}
    >
      <span className="font-mono text-[11px] text-muted-foreground/40 tracking-wide">
        {field.key}
      </span>
      <div className="flex-1 border-b border-dotted border-white/[0.04]" />
      <span
        className={`font-mono text-[11px] tracking-wide ${
          field.success ? "text-success" : "text-foreground/60"
        }`}
      >
        {field.value}
      </span>
    </motion.div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div
        className="absolute -inset-16 blur-[80px] opacity-[0.12] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, oklch(0.55 0.25 285), transparent 70%)",
        }}
      />

      {/* Outer container with subtle tilt */}
      <motion.div
        className="relative"
        style={{
          perspective: "1200px",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.35 }}
      >
        <div
          style={{
            transform: "rotateY(-4deg) rotateX(2deg)",
          }}
        >
          {/* Main card */}
          <div className="relative w-[300px] md:w-[340px] rounded-xl border border-white/[0.07] bg-card/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {/* Document section */}
            <div className="p-5 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="size-2.5 rounded-sm bg-primary/40" />
                  <motion.div
                    className="absolute inset-0 rounded-sm bg-primary/20"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{
                      duration: 2.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/40 tracking-[0.15em] uppercase">
                  invoice.pdf
                </span>
                <span className="ml-auto font-mono text-[9px] text-primary/30 tracking-wider">
                  scanning
                </span>
              </div>

              {/* Document lines with scan effect */}
              <div className="relative space-y-[7px]">
                {docLines.map((w, i) => (
                  <motion.div
                    key={`line-${w}-${i}`}
                    className="h-[5px] rounded-[2px] bg-white/[0.04]"
                    style={{ width: `${w * 100}%` }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
                <ScanLine />
              </div>
            </div>

            {/* Extraction boundary */}
            <ExtractorBeam />

            {/* Extracted data section */}
            <div className="p-5 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-2.5 rounded-sm bg-success/40" />
                <span className="font-mono text-[10px] text-muted-foreground/40 tracking-[0.15em] uppercase">
                  extracted
                </span>
                <span className="ml-auto font-mono text-[9px] text-success/40 tracking-wider">
                  4 fields
                </span>
              </div>

              <div className="space-y-0.5">
                {fields.map((field, i) => (
                  <FieldRow key={field.key} field={field} index={i} />
                ))}
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-success/20 to-transparent" />
          </div>
        </div>
      </motion.div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute -top-4 -right-4 size-1.5 rounded-full bg-primary/30"
        animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-6 -left-6 size-1 rounded-full bg-primary/20"
        animate={{ y: [0, 5, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 -right-8 size-1 rounded-full bg-success/25"
        animate={{ y: [0, -4, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 3.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
    </div>
  );
}
