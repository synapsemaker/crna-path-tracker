"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import styles from "./CrudPage.module.css";

type Props<T extends { id: string }> = {
  title: string;
  table: string;
  userId: string;
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  renderForm: (
    item: T | null,
    onChange: (field: string, value: unknown) => void,
    formData: Record<string, unknown>
  ) => React.ReactNode;
  defaultValues: Record<string, unknown>;
  emptyTitle?: string;
  emptyBody?: string;
  emptyMessage?: string;
  topContent?: React.ReactNode;
};

export default function CrudPage<T extends { id: string }>({
  title,
  table,
  userId,
  items: initial,
  renderCard,
  renderForm,
  defaultValues,
  emptyTitle,
  emptyBody,
  emptyMessage = "Nothing here yet",
  topContent,
}: Props<T>) {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>(defaultValues);
  const [saving, setSaving] = useState(false);

  function onChange(field: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function startAdd() {
    setFormData(defaultValues);
    setEditingId(null);
    setAdding(true);
  }

  function startEdit(item: T) {
    setFormData(item as unknown as Record<string, unknown>);
    setEditingId(item.id);
    setAdding(true);
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setFormData(defaultValues);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { id: _id, created_at: _ca, ...rest } = formData;
    // Convert empty strings to null for Supabase
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      cleaned[k] = v === "" ? null : v;
    }
    const data = { ...cleaned, user_id: userId };

    if (editingId) {
      const { data: updated } = await supabase
        .from(table)
        .update(data)
        .eq("id", editingId)
        .select()
        .single();
      if (updated) {
        setItems((prev) =>
          prev.map((i) => (i.id === editingId ? (updated as T) : i))
        );
      }
    } else {
      const { data: created } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      if (created) {
        setItems((prev) => [created as T, ...prev]);
      }
    }

    setSaving(false);
    cancel();
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from(table).delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title={title}
        action={
          !adding ? (
            <button onClick={startAdd} className={styles.addBtn}>
              + Add
            </button>
          ) : undefined
        }
      />

      {topContent}

      {adding && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {renderForm(editingId ? (items.find((i) => i.id === editingId) ?? null) : null, onChange, formData)}
          <div className={styles.formActions}>
            <button type="button" onClick={cancel} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 && !adding ? (
        <EmptyState
          title={emptyTitle ?? "Nothing here yet."}
          body={emptyBody ?? emptyMessage}
          action={
            <button onClick={startAdd} className={styles.addBtn}>
              + Add your first
            </button>
          }
        />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <Card key={item.id}>
              <div className={styles.cardContent}>
                {renderCard(item)}
                <div className={styles.cardActions}>
                  <button onClick={() => startEdit(item)} className={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>
                    ×
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
