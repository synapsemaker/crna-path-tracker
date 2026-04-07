"use client";

import type { VolunteerWork } from "@/lib/types";
import { VOLUNTEER_STATUSES } from "@/lib/constants";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import TextareaField from "@/components/forms/TextareaField";
import StatusBadge from "@/components/ui/StatusBadge";

export default function VolunteerClient({ items, userId }: { items: VolunteerWork[]; userId: string }) {
  return (
    <CrudPage
      title="Volunteer Work"
      table="volunteer_work"
      userId={userId}
      items={items}
      emptyMessage="No volunteer work added yet"
      defaultValues={{ organization: "", role: "", start_date: "", end_date: "", hours: "", description: "", status: "Ongoing" }}
      renderForm={(_, onChange, d) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Organization" value={d.organization as string} onChange={(v) => onChange("organization", v)} required />
          <Field label="Role" value={d.role as string} onChange={(v) => onChange("role", v)} />
          <Field label="Start date" value={d.start_date as string} onChange={(v) => onChange("start_date", v)} type="date" />
          <Field label="End date" value={d.end_date as string} onChange={(v) => onChange("end_date", v)} type="date" />
          <Field label="Hours" value={d.hours as string} onChange={(v) => onChange("hours", v)} type="number" step="0.5" />
          <SelectField label="Status" value={d.status as string} onChange={(v) => onChange("status", v)} options={VOLUNTEER_STATUSES} />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="Description" value={d.description as string} onChange={(v) => onChange("description", v)} rows={3} />
          </div>
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}>{item.organization}</span>
            <StatusBadge status={item.status} />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe)", letterSpacing: "0.08em" }}>
            {item.role}{item.hours ? ` · ${item.hours} hrs` : ""}
          </div>
        </div>
      )}
    />
  );
}
