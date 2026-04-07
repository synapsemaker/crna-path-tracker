"use client";

import type { Conference } from "@/lib/types";
import { CONFERENCE_STATUSES } from "@/lib/constants";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import TextareaField from "@/components/forms/TextareaField";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ConferencesClient({ items, userId }: { items: Conference[]; userId: string }) {
  return (
    <CrudPage
      title="Conferences"
      table="conferences"
      userId={userId}
      items={items}
      emptyTitle="Track conferences and continuing ed."
      emptyBody="AANA Annual Congress, state CRNA association meetings, ICU symposiums — these show programs you're invested in the profession beyond your job. Track what you've attended, what's coming up, and what you took away from each."
      defaultValues={{ name: "", organization: "", location: "", date: "", status: "Upcoming", key_takeaways: "", cost: "", notes: "" }}
      renderForm={(_, onChange, d) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Conference name" value={d.name as string} onChange={(v) => onChange("name", v)} required />
          <Field label="Organization" value={d.organization as string} onChange={(v) => onChange("organization", v)} />
          <Field label="Location" value={d.location as string} onChange={(v) => onChange("location", v)} />
          <Field label="Date" value={d.date as string} onChange={(v) => onChange("date", v)} type="date" />
          <SelectField label="Status" value={d.status as string} onChange={(v) => onChange("status", v)} options={CONFERENCE_STATUSES} />
          <Field label="Cost" value={d.cost as string} onChange={(v) => onChange("cost", v)} type="number" step="0.01" placeholder="$" />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="Key takeaways" value={d.key_takeaways as string} onChange={(v) => onChange("key_takeaways", v)} rows={2} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="Notes" value={d.notes as string} onChange={(v) => onChange("notes", v)} rows={2} />
          </div>
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}>{item.name}</span>
            <StatusBadge status={item.status} />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe)", letterSpacing: "0.08em" }}>
            {[item.organization, item.location, item.date && new Date(item.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })].filter(Boolean).join(" · ")}
          </div>
        </div>
      )}
    />
  );
}
