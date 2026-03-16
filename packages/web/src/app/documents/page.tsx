"use client";

import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Document } from "@/lib/api/client";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    try {
      setLoading(true);
      const docs = await api.documents.list();
      setDocuments(docs);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load documents",
      );
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
      toast.success("Document uploaded");
      await loadDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <PageHeader title="Documents">
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </PageHeader>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first document to get started with data extraction."
          actionLabel="Upload Document"
          onAction={() => inputRef.current?.click()}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {documents.map((doc) => (
            <Card key={doc.id} size="sm">
              <CardHeader>
                <CardTitle>{doc.filename}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{doc.content_type}</Badge>
                  <span className="text-xs text-muted-foreground">
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
