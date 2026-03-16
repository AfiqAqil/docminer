"use client";

import { Check, Copy, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
        {/* Left panel — inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Document</Label>
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
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
                onValueChange={setSelectedSchemaId}
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

        {/* Right panel — results */}
        <div className="md:col-span-2">
          {!job ? (
            <EmptyState
              icon={Sparkles}
              title="Ready to extract"
              description="Select a document and schema, then click Extract to pull structured data."
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Job #{job.id}</CardTitle>
                    <StatusBadge status={job.status} />
                  </div>
                  {job.status === "completed" && job.result && (
                    <Button variant="ghost" size="icon-sm" onClick={copyResult}>
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
                  <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-auto max-h-96">
                    {JSON.stringify(JSON.parse(job.result), null, 2)}
                  </pre>
                )}
                {job.status === "failed" && (
                  <p className="text-sm text-destructive">{job.error}</p>
                )}
                {isRunning && (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Processing your document...
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
