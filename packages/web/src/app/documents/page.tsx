"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Document } from "@/lib/api/client";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError(null);
      const docs = await api.documents.list();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await api.documents.upload(file);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload Document"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-zinc-400 text-sm">Loading…</p>
      ) : documents.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No documents yet. Upload one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {documents.map((doc) => (
            <Card key={doc.id} size="sm">
              <CardHeader>
                <CardTitle>{doc.filename}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{doc.content_type}</Badge>
                  <span className="text-xs text-zinc-400">
                    {new Date(doc.uploaded_at).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
