"use client";

import type { Essay } from "@/lib/types";
import { ESSAY_STATUSES } from "@/lib/constants";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import TextareaField from "@/components/forms/TextareaField";
import StatusBadge from "@/components/ui/StatusBadge";

export default function EssaysClient({ items, userId }: { items: Essay[]; userId: string }) {
  return (
    <CrudPage
      title="Essays"
      table="essays"
      userId={userId}
      items={items}
      emptyMessage="No essays started yet"
      defaultValues={{ school_name: "", prompt_text: "", word_limit: "", draft: "", status: "Brainstorm", deadline: "", key_points: "" }}
      renderForm={(_, onChange, d) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="School" value={d.school_name as string} onChange={(v) => onChange("school_name", v)} />
          <SelectField label="Status" value={d.status as string} onChange={(v) => onChange("status", v)} options={ESSAY_STATUSES} />
          <Field label="Word limit" value={d.word_limit as string} onChange={(v) => onChange("word_limit", v)} type="number" />
          <Field label="Deadline" value={d.deadline as string} onChange={(v) => onChange("deadline", v)} type="date" />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="Prompt" value={d.prompt_text as string} onChange={(v) => onChange("prompt_text", v)} rows={2} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="Key points" value={d.key_points as string} onChange={(v) => onChange("key_points", v)} placeholder="Main ideas to include" rows={2} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="Draft" value={d.draft as string} onChange={(v) => onChange("draft", v)} rows={8} />
          </div>
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}>{item.school_name || "Untitled essay"}</span>
            <StatusBadge status={item.status} />
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--taupe)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>
            {item.prompt_text ?? "No prompt"}
          </div>
        </div>
      )}
    />
  );
}
