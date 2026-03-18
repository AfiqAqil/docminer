"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/effects/neon-border";
import { ParticleCanvas } from "@/components/effects/particle-canvas";
import { ScanLine } from "@/components/effects/scan-line";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  api,
  type Document,
  type ExtractionJob,
  type Schema,
} from "@/lib/api/client";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function ExtractPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>("");
  const [job, setJob] = useState<ExtractionJob | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([api.documents.list(), api.schemas.list()])
      .then(([docs, schs]) => {
        setDocuments(docs);
        setSchemas(schs);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Failed to load data"),
      );
  }, []);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const updated = await api.extract.get(job.id);
        setJob(updated);
      } catch {
        // ignore transient errors
      }
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [job?.id, job?.status]);

  async function handleExtract() {
    if (!selectedDocId || !selectedSchemaId) return;
    try {
      setExtracting(true);
      setJob(null);
      const newJob = await api.extract.start(
        Number(selectedDocId),
        Number(selectedSchemaId),
      );
      setJob(newJob);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function copyResult() {
    if (!job?.result) return;
    await navigator.clipboard.writeText(
      JSON.stringify(JSON.parse(job.result), null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canExtract =
    selectedDocId !== "" && selectedSchemaId !== "" && !extracting;
  const isRunning = job?.status === "pending" || job?.status === "processing";

  return (
    <div>
      <PageHeader title="Extract" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel — configuration */}
        <div className="relative">
          <ScanLine active={isRunning ?? false}>
            <Card className="ring-1 ring-white/[0.06]">
              <CardHeader>
                <CardTitle className="font-display">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Document</Label>
                  <Select
                    value={selectedDocId}
                    onValueChange={(v) => setSelectedDocId(v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.filename}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Schema</Label>
                  <Select
                    value={selectedSchemaId}
                    onValueChange={(v) => setSelectedSchemaId(v ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a schema..." />
                    </SelectTrigger>
                    <SelectContent>
                      {schemas.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleExtract}
                  disabled={!canExtract || isRunning}
                  className="w-full"
                >
                  {isRunning
                    ? "Extracting..."
                    : extracting
                      ? "Starting..."
                      : "Extract"}
                </Button>
              </CardContent>
            </Card>
          </ScanLine>

          {/* Particle drift between panels during processing */}
          {isRunning && (
            <div className="hidden md:block absolute -right-6 top-0 bottom-0 w-12 overflow-hidden">
              <ParticleCanvas count={15} className="w-full h-full opacity-60" />
            </div>
          )}
        </div>

        {/* Right panel — results */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {!job ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <EmptyState
                  icon={Sparkles}
                  title="Ready to extract"
                  description="Select a document and schema, then click Extract to pull structured data."
                />
              </motion.div>
            ) : (
              <motion.div
                key={`job-${job.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {job.status === "failed" ? (
                  <NeonBorder color="destructive">
                    <Card className="glitch-shake">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="font-display">
                              Job #{job.id}
                            </CardTitle>
                            <StatusBadge status={job.status} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-destructive">{job.error}</p>
                      </CardContent>
                    </Card>
                  </NeonBorder>
                ) : (
                  <Card className="ring-1 ring-white/[0.06]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="font-display">
                            Job #{job.id}
                          </CardTitle>
                          <StatusBadge status={job.status} />
                        </div>
                        {job.status === "completed" && job.result && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={copyResult}
                          >
                            {copied ? (
                              <Check className="size-4 text-emerald-400" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {job.status === "completed" && job.result && (
                        <ResultTerminal result={job.result} />
                      )}
                      {isRunning && (
                        <div className="relative">
                          <div className="laser-progress mb-3" />
                          <p className="text-sm text-muted-foreground terminal-text">
                            Processing your document...
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ResultTerminal({ result }: { result: string }) {
  const parsed = JSON.parse(result) as Record<string, unknown>;
  const entries = Object.entries(parsed);

  return (
    <div className="bg-black/30 ring-1 ring-white/[0.04] rounded-lg overflow-hidden">
      <div className="scan-line h-1 bg-primary/10" />
      <div className="px-4 py-3 font-mono text-xs">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <span className="terminal-text">{"{"}</span>
          </motion.div>
          {entries.map(([key, value]) => (
            <motion.div key={key} variants={staggerItem} className="pl-4">
              <span className="text-muted-foreground">{key}</span>
              <span className="terminal-text">: {JSON.stringify(value)}</span>
            </motion.div>
          ))}
          <motion.div variants={staggerItem}>
            <span className="terminal-text">{"}"}</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
