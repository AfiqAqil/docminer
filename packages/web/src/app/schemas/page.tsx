"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Schema } from "@/lib/api/client";

const FIELD_TYPES = [
  "str",
  "int",
  "float",
  "bool",
  "str | None",
  "int | None",
  "float | None",
  "bool | None",
];

interface FieldRow {
  name: string;
  type: string;
}

export default function SchemasPage() {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [schemaName, setSchemaName] = useState("");
  const [fields, setFields] = useState<FieldRow[]>([{ name: "", type: "str" }]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadSchemas() {
    try {
      setLoading(true);
      setError(null);
      setSchemas(await api.schemas.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schemas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchemas();
  }, []);

  function addField() {
    setFields((prev) => [...prev, { name: "", type: "str" }]);
  }

  function removeField(i: number) {
    setFields((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateField(i: number, key: keyof FieldRow, value: string) {
    setFields((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [key]: value } : f))
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const definition: Record<string, string> = {};
    for (const f of fields) {
      if (f.name.trim()) definition[f.name.trim()] = f.type;
    }
    if (!schemaName.trim() || Object.keys(definition).length === 0) {
      setError("Schema name and at least one field are required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.schemas.create(schemaName.trim(), definition);
      setSchemaName("");
      setFields([{ name: "", type: "str" }]);
      setShowForm(false);
      await loadSchemas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schema");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      setDeletingId(id);
      await api.schemas.delete(id);
      await loadSchemas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete schema");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Schemas</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New Schema"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <input
                className="border rounded px-3 py-2 text-sm w-full"
                placeholder="Schema name (e.g. Invoice)"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                {fields.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="border rounded px-3 py-2 text-sm flex-1"
                      placeholder="field_name"
                      value={f.name}
                      onChange={(e) => updateField(i, "name", e.target.value)}
                    />
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={f.type}
                      onChange={(e) => updateField(i, "type", e.target.value)}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(i)}
                        className="text-zinc-400 hover:text-red-500 px-2 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addField}>
                  + Add Field
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-zinc-400 text-sm">Loading…</p>
      ) : schemas.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No schemas yet. Create one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {schemas.map((schema) => {
            const definition = JSON.parse(schema.definition) as Record<
              string,
              string
            >;
            const fieldCount = Object.keys(definition).length;
            return (
              <Card key={schema.id} size="sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{schema.name}</CardTitle>
                    <button
                      onClick={() => handleDelete(schema.id)}
                      disabled={deletingId === schema.id}
                      className="text-xs text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === schema.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary">
                      {fieldCount} field{fieldCount !== 1 ? "s" : ""}
                    </Badge>
                    {Object.entries(definition).map(([k, v]) => (
                      <span key={k} className="text-xs text-zinc-400">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
