import { Gem } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="perspective-grid" aria-hidden="true" />

      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Gem className="size-10 text-primary logo-pulse-continuous" />
          <h1 className="font-display text-5xl font-bold tracking-tight">
            docminer
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
          Schema-driven document extraction powered by AI. Upload a document,
          define a schema, get structured JSON back.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--glow-md)] transition-all hover:scale-[1.02] hover:shadow-[var(--glow-lg)]"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
