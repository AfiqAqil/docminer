"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl" />
    ),
  },
);

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Text overlay */}
      <div className="relative z-10 text-center px-4">
        <motion.h1
          className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-primary">doc</span>miner
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Extract structured data from documents using AI and custom schemas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <Link
            href="/app"
            className={buttonVariants({ size: "lg" })}
            style={{
              boxShadow:
                "0 0 20px oklch(0.55 0.25 285 / 30%), 0 0 60px oklch(0.55 0.25 285 / 10%)",
            }}
          >
            Get Started
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
