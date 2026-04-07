"use client";

import type { ShadowingHour } from "@/lib/types";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import TextareaField from "@/components/forms/TextareaField";
import StatCard from "@/components/ui/StatCard";

type Props = {
  entries: ShadowingHour[];
  userId: string;
  totalHours: number;
};

export default function ShadowingClient({ entries, userId, totalHours }: Props) {
  return (
    <CrudPage
      title="Shadowing"
      table="shadowing_hours"
      userId={userId}
      items={entries}
      emptyTitle="Log your shadowing hours."
      emptyBody="Most CRNA programs want 8–40+ hours of shadowing a practicing CRNA. It proves you understand the role beyond what you've seen as a bedside RN. Log every shift here — date, facility, hours, what cases you observed."
      topContent={
        <div style={{ marginBottom: 24, maxWidth: 160 }}>
          <StatCard label="Total hours" value={totalHours} />
        </div>
      }
      defaultValues={{ date: "", facility: "", crna_name: "", hours: "", cases_observed: "", notes: "" }}
      renderForm={(_, onChange, data) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Date" value={data.date as string} onChange={(v) => onChange("date", v)} type="date" />
          <Field label="Hours" value={data.hours as string} onChange={(v) => onChange("hours", v)} type="number" step="0.5" required />
          <Field label="Facility" value={data.facility as string} onChange={(v) => onChange("facility", v)} />
          <Field label="CRNA name" value={data.crna_name as string} onChange={(v) => onChange("crna_name", v)} />
          <Field label="Cases observed" value={data.cases_observed as string} onChange={(v) => onChange("cases_observed", v)} />
          <TextareaField label="Notes" value={data.notes as string} onChange={(v) => onChange("notes", v)} rows={2} />
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>
            {item.facility ?? "Shadowing"} — {item.hours ?? 0} hrs
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe)", letterSpacing: "0.08em" }}>
            {item.date && new Date(item.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {item.crna_name && ` · ${item.crna_name}`}
          </div>
        </div>
      )}
    />
  );
}
