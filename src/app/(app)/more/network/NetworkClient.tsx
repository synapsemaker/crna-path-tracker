"use client";

import type { NetworkContact } from "@/lib/types";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import TextareaField from "@/components/forms/TextareaField";

export default function NetworkClient({ items, userId }: { items: NetworkContact[]; userId: string }) {
  return (
    <CrudPage
      title="Network"
      table="network"
      userId={userId}
      items={items}
      emptyTitle="Build your CRNA network."
      emptyBody="Track every CRNA, professor, program director, alumnus, and current student you connect with. These are your future recommenders, mentors, and the people who can answer questions you can't ask Google. Note when you met and when to follow up."
      defaultValues={{ name: "", profession: "", affiliation: "", email: "", meeting_date: "", follow_up_date: "", notes: "" }}
      renderForm={(_, onChange, d) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Name" value={d.name as string} onChange={(v) => onChange("name", v)} required />
          <Field label="Profession" value={d.profession as string} onChange={(v) => onChange("profession", v)} />
          <Field label="Affiliation" value={d.affiliation as string} onChange={(v) => onChange("affiliation", v)} />
          <Field label="Email" value={d.email as string} onChange={(v) => onChange("email", v)} type="email" />
          <Field label="Meeting date" value={d.meeting_date as string} onChange={(v) => onChange("meeting_date", v)} type="date" />
          <Field label="Follow-up date" value={d.follow_up_date as string} onChange={(v) => onChange("follow_up_date", v)} type="date" />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="Notes" value={d.notes as string} onChange={(v) => onChange("notes", v)} rows={2} />
          </div>
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)", marginBottom: 2 }}>
            {item.name}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe)", letterSpacing: "0.08em" }}>
            {[item.profession, item.affiliation].filter(Boolean).join(" · ")}
          </div>
        </div>
      )}
    />
  );
}
