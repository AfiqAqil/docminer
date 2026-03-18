"use client";

import { motion } from "framer-motion";
import { Braces, CheckCircle2, FileUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CountUp } from "@/components/effects/count-up";
import { ParticleCanvas } from "@/components/effects/particle-canvas";
import { ScanLine } from "@/components/effects/scan-line";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  api,
  type Document,
  type ExtractionJob,
  type Schema,
} from "@/lib/api/client";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [extractions, setExtractions] = useState<ExtractionJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.documents.list(), api.schemas.list(), api.extract.list()])
      .then(([docs, schs, jobs]) => {
        setDocuments(docs);
        setSchemas(schs);
        setExtractions(jobs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const isEmpty = documents.length === 0 && schemas.length === 0;

  if (isEmpty) {
    return (
      <OnboardingView
        hasDocuments={documents.length > 0}
        hasSchemas={schemas.length > 0}
      />
    );
  }

  return (
    <StatsView
      documents={documents}
      schemas={schemas}
      extractions={extractions}
    />
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-6 w-48 mb-4 rounded" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[52px] w-full rounded-xl mb-2" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onboarding (empty state)
// ---------------------------------------------------------------------------

const steps = [
  {
    icon: FileUp,
    title: "Upload a document",
    description: "Add an image or PDF you want to extract data from.",
    href: "/app/documents",
    label: "Upload",
  },
  {
    icon: Braces,
    title: "Define a schema",
    description: "Describe the fields you want to extract.",
    href: "/app/schemas",
    label: "Create",
  },
  {
    icon: Sparkles,
    title: "Extract data",
    description: "Let the AI pull structured data from your document.",
    href: "/app/extract",
    label: "Extract",
  },
];

function OnboardingView({
  hasDocuments,
  hasSchemas,
}: {
  hasDocuments: boolean;
  hasSchemas: boolean;
}) {
  const completed = [hasDocuments, hasSchemas, false];

  return (
    <div>
      <div className="text-center mb-14 mt-10">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-3">
          Welcome to <span className="text-primary">docminer</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-[15px]">
          Extract structured data from documents using AI and custom schemas.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {steps.map((step, i) => {
          const done = completed[i];
          return (
            <motion.div key={step.title} variants={staggerItem}>
              <Card
                className={`card-hover relative ${done ? "ring-1 ring-emerald-500/20" : "ring-1 ring-white/[0.06]"}`}
              >
                <CardHeader className="items-center text-center">
                  <div className="text-xs text-muted-foreground mb-2 font-display">
                    Step {i + 1}
                  </div>
                  <div
                    className={`rounded-xl p-3.5 mb-2 ${
                      done
                        ? "bg-emerald-500/10 shadow-[var(--glow-success-md)]"
                        : "bg-primary/10 shadow-[var(--glow-md)]"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="size-6 text-emerald-400" />
                    ) : (
                      <step.icon className="size-6 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-base font-display">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {step.description}
                  </p>
                  <Link
                    href={step.href}
                    className={buttonVariants({
                      variant: done ? "outline" : "default",
                      size: "sm",
                    })}
                  >
                    {done ? "Done" : step.label}
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats + Recent Extractions (populated state)
// ---------------------------------------------------------------------------

function StatsView({
  documents,
  schemas,
  extractions,
}: {
  documents: Document[];
  schemas: Schema[];
  extractions: ExtractionJob[];
}) {
  const completedCount = extractions.filter(
    (j) => j.status === "completed",
  ).length;
  const successRate =
    extractions.length > 0
      ? Math.round((completedCount / extractions.length) * 100)
      : 0;

  const docMap = new Map(documents.map((d) => [d.id, d.filename]));
  const schemaMap = new Map(schemas.map((s) => [s.id, s.name]));

  const recent = extractions.slice(0, 5);

  return (
    <div className="relative">
      <ParticleCanvas
        count={20}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      <div className="relative z-10">
        <PageHeader title="Dashboard">
          <Link href="/app/extract" className={buttonVariants()}>
            New Extraction
          </Link>
        </PageHeader>

        {/* Stat cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <StatCard label="Documents" value={documents.length} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard label="Schemas" value={schemas.length} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard label="Extractions" value={extractions.length} />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatCard
              label="Success Rate"
              value={successRate}
              suffix="%"
              glow="success"
            />
          </motion.div>
        </motion.div>

        {/* Recent extractions */}
        {recent.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <h2 className="font-display text-lg font-medium mb-4">
              Recent Extractions
            </h2>
            <div className="flex flex-col gap-2">
              {recent.map((job) => (
                <motion.div key={job.id} variants={staggerItem}>
                  <ScanLine onHover>
                    <Card
                      size="sm"
                      className="card-hover ring-1 ring-white/[0.06]"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              {docMap.get(job.document_id) ??
                                `Doc #${job.document_id}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {schemaMap.get(job.schema_id) ??
                                `Schema #${job.schema_id}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge
                              status={
                                job.status as
                                  | "pending"
                                  | "processing"
                                  | "completed"
                                  | "failed"
                              }
                            />
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatRelativeTime(job.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </ScanLine>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  glow,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  glow?: "success";
}) {
  const numericValue = typeof value === "number" ? value : null;
  return (
    <Card
      className={`card-hover ring-1 ring-white/[0.06] ${glow === "success" ? "hover:shadow-[var(--glow-success-sm)]" : ""}`}
    >
      <CardContent className="pt-4">
        <p className="font-display text-2xl font-bold tracking-tight">
          {numericValue !== null ? (
            <CountUp value={numericValue} suffix={suffix} />
          ) : (
            value
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
