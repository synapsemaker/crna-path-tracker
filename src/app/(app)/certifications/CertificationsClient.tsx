"use client";

import type { Certification } from "@/lib/types";
import { CERTIFICATION_NAMES, CERTIFICATION_STATUSES } from "@/lib/constants";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import StatusBadge from "@/components/ui/StatusBadge";

type Props = {
  certs: Certification[];
  userId: string;
};

export default function CertificationsClient({ certs, userId }: Props) {
  return (
    <CrudPage
      title="Certifications"
      table="certifications"
      userId={userId}
      items={certs}
      emptyMessage="No certifications added yet"
      defaultValues={{ name: "CCRN", other_name: "", certification_number: "", issue_date: "", expiration_date: "", status: "In Progress" }}
      renderForm={(_, onChange, data) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <SelectField label="Certification" value={data.name as string} onChange={(v) => onChange("name", v)} options={CERTIFICATION_NAMES} />
          {data.name === "Other" && (
            <Field label="Other name" value={data.other_name as string} onChange={(v) => onChange("other_name", v)} required />
          )}
          <Field label="Certification number" value={data.certification_number as string} onChange={(v) => onChange("certification_number", v)} />
          <SelectField label="Status" value={data.status as string} onChange={(v) => onChange("status", v)} options={CERTIFICATION_STATUSES} />
          <Field label="Issue date" value={data.issue_date as string} onChange={(v) => onChange("issue_date", v)} type="date" />
          <Field label="Expiration date" value={data.expiration_date as string} onChange={(v) => onChange("expiration_date", v)} type="date" />
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 400, color: "var(--ink)" }}>
              {item.name === "Other" ? item.other_name : item.name}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe)", letterSpacing: "0.08em" }}>
            {item.expiration_date && `Expires ${new Date(item.expiration_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </div>
        </div>
      )}
    />
  );
}
