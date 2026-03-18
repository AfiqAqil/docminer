"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroVisual } from "./hero-visual";

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Left — Text content */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            {/* Overline */}
            <motion.div
              className="inline-flex items-center gap-2.5 mb-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            >
              <span className="h-px w-5 bg-primary/40" />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-primary/50">
                Schema-driven extraction
              </span>
              <span className="h-px w-5 bg-primary/40 hidden lg:block" />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="font-display text-[3.5rem] md:text-[5rem] lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.85] mb-5"
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.85, ease: "easeOut" }}
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.785 0.18 285) 0%, oklch(0.55 0.25 285) 50%, oklch(0.45 0.22 285) 100%)",
                }}
              >
                doc
              </span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(160deg, oklch(0.97 0.005 285) 0%, oklch(0.78 0.04 285) 100%)",
                }}
              >
                miner
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-[15px] md:text-base text-muted-foreground/60 leading-relaxed mb-9 max-w-sm mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            >
              Documents in. Structured data out.
              <br />
              Define a schema, upload a file, let AI extract exactly what you
              need.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center lg:items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <Link
                href="/app"
                className="group relative inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  boxShadow:
                    "0 0 20px oklch(0.55 0.25 285 / 22%), 0 0 60px oklch(0.55 0.25 285 / 6%), inset 0 1px 0 oklch(1 0 0 / 8%)",
                }}
              >
                Get Started
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center h-10 px-5 rounded-lg text-sm text-muted-foreground/50 transition-colors hover:text-foreground/70"
              >
                How it works
              </a>
            </motion.div>
          </div>

          {/* Right — Extraction visual */}
          <div className="flex-shrink-0 hidden md:flex items-center justify-center">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* Bottom decorative divider */}
      <motion.div
        className="absolute bottom-14 left-0 right-0 z-10 flex items-center gap-3 px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.9 }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/10 to-primary/20" />
        <div className="size-[3px] rounded-full bg-primary/25" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/10 to-primary/20" />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
