"use client";

import type { LetterOfRec } from "@/lib/types";
import { LETTER_STATUSES } from "@/lib/constants";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import TextareaField from "@/components/forms/TextareaField";
import StatusBadge from "@/components/ui/StatusBadge";

export default function LettersClient({ items, userId }: { items: LetterOfRec[]; userId: string }) {
  return (
    <CrudPage
      title="Letters of Rec"
      table="letters_of_rec"
      userId={userId}
      items={items}
      emptyMessage="No letters of recommendation yet"
      defaultValues={{ recommender_name: "", recommender_title: "", recommender_email: "", relationship: "", request_date: "", due_date: "", status: "Pending", school_name: "", notes: "" }}
      renderForm={(_, onChange, d) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Recommender name" value={d.recommender_name as string} onChange={(v) => onChange("recommender_name", v)} required />
          <Field label="Title" value={d.recommender_title as string} onChange={(v) => onChange("recommender_title", v)} />
          <Field label="Email" value={d.recommender_email as string} onChange={(v) => onChange("recommender_email", v)} type="email" />
          <Field label="Relationship" value={d.relationship as string} onChange={(v) => onChange("relationship", v)} placeholder="e.g. Charge nurse, professor" />
          <SelectField label="Status" value={d.status as string} onChange={(v) => onChange("status", v)} options={LETTER_STATUSES} />
          <Field label="School" value={d.school_name as string} onChange={(v) => onChange("school_name", v)} />
          <Field label="Request date" value={d.request_date as string} onChange={(v) => onChange("request_date", v)} type="date" />
          <Field label="Due date" value={d.due_date as string} onChange={(v) => onChange("due_date", v)} type="date" />
          <TextareaField label="Notes" value={d.notes as string} onChange={(v) => onChange("notes", v)} rows={2} />
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}>{item.recommender_name}</span>
            <StatusBadge status={item.status} />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe)", letterSpacing: "0.08em" }}>
            {item.recommender_title}{item.school_name ? ` · ${item.school_name}` : ""}
          </div>
        </div>
      )}
    />
  );
}
