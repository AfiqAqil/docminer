const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  documents: {
    list: () => request<Document[]>("/documents"),
    upload: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<Document>("/documents/upload", {
        method: "POST",
        body: form,
        headers: {},
      });
    },
  },
  schemas: {
    list: () => request<Schema[]>("/schemas"),
    get: (id: number) => request<Schema>(`/schemas/${id}`),
    create: (name: string, definition: Record<string, string>) =>
      request<Schema>("/schemas", {
        method: "POST",
        body: JSON.stringify({ name, definition }),
      }),
    delete: (id: number) =>
      request<void>(`/schemas/${id}`, { method: "DELETE" }),
  },
  extract: {
    start: (document_id: number, schema_id: number) =>
      request<ExtractionJob>("/extract", {
        method: "POST",
        body: JSON.stringify({ document_id, schema_id }),
      }),
    get: (id: number) => request<ExtractionJob>(`/extract/${id}`),
  },
};

// Minimal local types — replaced by generated types after `make codegen`
export interface Document {
  id: number;
  filename: string;
  content_type: string;
  file_path: string;
  uploaded_at: string;
}

export interface Schema {
  id: number;
  name: string;
  definition: string;
  created_at: string;
}

export interface ExtractionJob {
  id: number;
  document_id: number;
  schema_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  result: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}
