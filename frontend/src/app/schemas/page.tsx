"use client";

import { Braces } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Schema | null>(null);
  const [schemaName, setSchemaName] = useState("");
  const [fields, setFields] = useState<FieldRow[]>([{ name: "", type: "str" }]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadSchemas() {
    try {
      setLoading(true);
      setSchemas(await api.schemas.list());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load schemas",
      );
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
      prev.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)),
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const definition: Record<string, string> = {};
    for (const f of fields) {
      if (f.name.trim()) definition[f.name.trim()] = f.type;
    }
    if (!schemaName.trim() || Object.keys(definition).length === 0) {
      toast.error("Schema name and at least one field are required.");
      return;
    }
    try {
      setSaving(true);
      await api.schemas.create(schemaName.trim(), definition);
      toast.success("Schema created");
      setSchemaName("");
      setFields([{ name: "", type: "str" }]);
      setCreateOpen(false);
      await loadSchemas();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create schema",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.schemas.delete(deleteTarget.id);
      toast.success("Schema deleted");
      setDeleteTarget(null);
      await loadSchemas();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete schema",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Schemas">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button />}>New Schema</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Schema</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="schema-name">Name</Label>
                <Input
                  id="schema-name"
                  placeholder="e.g. Invoice"
                  value={schemaName}
                  onChange={(e) => setSchemaName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Fields</Label>
                {fields.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="field_name"
                      value={f.name}
                      onChange={(e) => updateField(i, "name", e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={f.type}
                      onValueChange={(v) => updateField(i, "type", v ?? "str")}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeField(i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  + Add Field
                </Button>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Schema"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete schema</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete <strong>{deleteTarget?.name}</strong>? This can't be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : schemas.length === 0 ? (
        <EmptyState
          icon={Braces}
          title="No schemas yet"
          description="Create a schema to define what data to extract from your documents."
          actionLabel="New Schema"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="flex flex-col gap-3 stagger-children">
          {schemas.map((schema) => {
            const definition = JSON.parse(schema.definition) as Record<
              string,
              string
            >;
            const fieldCount = Object.keys(definition).length;
            return (
              <Card
                key={schema.id}
                size="sm"
                className="card-hover ring-1 ring-white/[0.06]"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{schema.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setDeleteTarget(schema)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary">
                      {fieldCount} field{fieldCount !== 1 ? "s" : ""}
                    </Badge>
                    {Object.entries(definition).map(([k, v]) => (
                      <Badge
                        key={k}
                        variant="outline"
                        className="text-xs font-mono"
                      >
                        {k}: {v}
                      </Badge>
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
