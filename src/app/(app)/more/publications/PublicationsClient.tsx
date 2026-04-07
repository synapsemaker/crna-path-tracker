"use client";

import type { Publication } from "@/lib/types";
import { PUBLICATION_ROLES } from "@/lib/constants";
import CrudPage from "@/components/CrudPage";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import TextareaField from "@/components/forms/TextareaField";

export default function PublicationsClient({ items, userId }: { items: Publication[]; userId: string }) {
  return (
    <CrudPage
      title="Publications"
      table="publications"
      userId={userId}
      items={items}
      emptyMessage="No publications yet"
      defaultValues={{ title: "", authors: "", journal_name: "", publication_year: "", doi: "", role: "", apa_citation: "" }}
      renderForm={(_, onChange, d) => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Title" value={d.title as string} onChange={(v) => onChange("title", v)} required />
          <Field label="Authors" value={d.authors as string} onChange={(v) => onChange("authors", v)} />
          <Field label="Journal" value={d.journal_name as string} onChange={(v) => onChange("journal_name", v)} />
          <Field label="Year" value={d.publication_year as string} onChange={(v) => onChange("publication_year", v)} type="number" />
          <Field label="DOI" value={d.doi as string} onChange={(v) => onChange("doi", v)} />
          <SelectField label="Role" value={d.role as string} onChange={(v) => onChange("role", v)} options={PUBLICATION_ROLES} placeholder="Select role" />
          <div style={{ gridColumn: "1 / -1" }}>
            <TextareaField label="APA citation" value={d.apa_citation as string} onChange={(v) => onChange("apa_citation", v)} rows={3} />
          </div>
        </div>
      )}
      renderCard={(item) => (
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)", marginBottom: 2 }}>
            {item.title}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--taupe)", letterSpacing: "0.08em" }}>
            {[item.journal_name, item.publication_year, item.role].filter(Boolean).join(" · ")}
          </div>
        </div>
      )}
    />
  );
}
