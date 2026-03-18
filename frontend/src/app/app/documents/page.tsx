"use client";

import { motion } from "framer-motion";
import { FileText, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NeonBorder } from "@/components/effects/neon-border";
import { ScanLine } from "@/components/effects/scan-line";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Document } from "@/lib/api/client";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

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

  const uploadFile = useCallback(async (file: File) => {
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
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current += 1;
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setDragOver(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
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

      {/* Drag-and-drop zone */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop zone uses native drag events */}
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className="mb-6"
      >
        {dragOver ? (
          <NeonBorder pulse>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Upload className="size-8 text-primary mb-3" />
              <p className="text-sm text-primary font-medium">
                Drop your file here
              </p>
            </div>
          </NeonBorder>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center justify-center w-full py-6 text-center border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-primary/30 transition-colors bg-transparent"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-5 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Drag & drop or click to upload
            </p>
          </button>
        )}
      </div>

      {/* Upload progress */}
      {uploading && <div className="laser-progress mb-6" />}

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
        <motion.div
          className="flex flex-col gap-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {documents.map((doc) => (
            <motion.div key={doc.id} variants={staggerItem}>
              <ScanLine onHover>
                <Card size="sm" className="card-hover ring-1 ring-white/[0.06]">
                  <CardHeader>
                    <CardTitle>{doc.filename}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{doc.content_type}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(doc.uploaded_at).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </ScanLine>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
