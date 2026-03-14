"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Document, type ExtractionJob, type Schema } from "@/lib/api/client";

const STATUS_VARIANT: Record<ExtractionJob["status"], "secondary" | "outline" | "default" | "destructive"> = {
  pending: "secondary",
  processing: "outline",
  completed: "default",
  failed: "destructive",
};

export default function ExtractPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | "">("");
  const [selectedSchemaId, setSelectedSchemaId] = useState<number | "">("");
  const [job, setJob] = useState<ExtractionJob | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([api.documents.list(), api.schemas.list()])
      .then(([docs, schs]) => {
        setDocuments(docs);
        setSchemas(schs);
      })
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Failed to load data")
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
      setExtractError(null);
      setJob(null);
      const newJob = await api.extract.start(
        Number(selectedDocId),
        Number(selectedSchemaId)
      );
      setJob(newJob);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  const canExtract = selectedDocId !== "" && selectedSchemaId !== "" && !extracting;
  const isRunning = job?.status === "pending" || job?.status === "processing";

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Extract</h1>

      {loadError && (
        <p className="text-sm text-red-500 mb-4">{loadError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Document</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedDocId}
              onChange={(e) =>
                setSelectedDocId(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Select a document…</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Schema</label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedSchemaId}
              onChange={(e) =>
                setSelectedSchemaId(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Select a schema…</option>
              {schemas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleExtract} disabled={!canExtract || isRunning}>
            {isRunning ? "Extracting…" : extracting ? "Starting…" : "Extract"}
          </Button>

          {extractError && (
            <p className="text-sm text-red-500">{extractError}</p>
          )}
        </div>

        <div className="md:col-span-2">
          {!job ? (
            <p className="text-zinc-400 text-sm">
              Select a document and schema, then click Extract.
            </p>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Job #{job.id}</CardTitle>
                  <Badge variant={STATUS_VARIANT[job.status]}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {job.status === "completed" && job.result && (
                  <pre className="bg-zinc-50 border rounded p-4 text-xs overflow-auto max-h-96">
                    {JSON.stringify(JSON.parse(job.result), null, 2)}
                  </pre>
                )}
                {job.status === "failed" && (
                  <p className="text-sm text-red-500">{job.error}</p>
                )}
                {isRunning && (
                  <p className="text-sm text-zinc-400">Processing…</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
