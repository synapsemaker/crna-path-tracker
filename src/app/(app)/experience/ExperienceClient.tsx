"use client";

import type { HospitalUnit } from "@/lib/types";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import TextareaField from "@/components/forms/TextareaField";
import CheckboxField from "@/components/forms/CheckboxField";

type Props = {
  units: HospitalUnit[];
  userId: string;
};

export default function ExperienceClient({ units, userId }: Props) {
  return (
    <CrudPage
      title="Experience"
      table="hospital_units"
      userId={userId}
      items={units}
      emptyTitle="Track your clinical experience."
      emptyBody="Most CRNA programs require 1–3 years of critical care RN experience. Competitive applicants have 2+ years in a high-acuity ICU (Level 1/2 trauma, CVICU, MICU, SICU). Add each role with start and end dates — programs will count your months of experience as of their application deadline."
      defaultValues={{ hospital_name: "", unit_name: "", position: "", start_date: "", end_date: "", current: false, patient_population: "", key_experience: "" }}
      renderForm={(_, onChange, data) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Hospital" value={data.hospital_name as string} onChange={(v) => onChange("hospital_name", v)} required />
          <Field label="Unit" value={data.unit_name as string} onChange={(v) => onChange("unit_name", v)} />
          <Field label="Position" value={data.position as string} onChange={(v) => onChange("position", v)} />
          <Field label="Start date" value={data.start_date as string} onChange={(v) => onChange("start_date", v)} type="date" />
          <div>
            <CheckboxField
              label="Currently here"
              checked={data.current as boolean}
              onChange={(v) => {
                onChange("current", v);
                if (v) onChange("end_date", null);
              }}
            />
          </div>
          {!data.current && (
            <Field label="End date" value={data.end_date as string ?? ""} onChange={(v) => onChange("end_date", v)} type="date" />
          )}
          <Field label="Patient population" value={data.patient_population as string} onChange={(v) => onChange("patient_population", v)} />
          <TextareaField label="Key experience" value={data.key_experience as string} onChange={(v) => onChange("key_experience", v)} rows={2} />
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 400, color: "var(--ink)", marginBottom: 2 }}>
            {item.hospital_name}{item.unit_name ? ` — ${item.unit_name}` : ""}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--taupe)", marginBottom: 4 }}>
            {item.position}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe-light)", letterSpacing: "0.08em" }}>
            {item.start_date && new Date(item.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            {" — "}
            {item.current ? "Present" : item.end_date ? new Date(item.end_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
          </div>
        </div>
      )}
    />
  );
}
