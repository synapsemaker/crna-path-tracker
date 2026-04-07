"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AcademicProfile } from "@/lib/types";
import Field from "@/components/forms/Field";
import FormActions from "@/components/forms/FormActions";

type Props = {
  profile: AcademicProfile | null;
  userId: string;
};

export default function GREForm({ profile, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [verbal, setVerbal] = useState(profile?.gre_verbal?.toString() ?? "");
  const [quant, setQuant] = useState(profile?.gre_quantitative?.toString() ?? "");
  const [writing, setWriting] = useState(profile?.gre_writing?.toString() ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("academic_profile").upsert(
      {
        user_id: userId,
        gre_verbal: verbal ? parseInt(verbal) : null,
        gre_quantitative: quant ? parseInt(quant) : null,
        gre_writing: writing ? parseFloat(writing) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--taupe)",
          marginBottom: 14,
        }}
      >
        GRE Scores
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, maxWidth: 480 }}>
          <Field label="Verbal" value={verbal} onChange={setVerbal} type="number" min={130} max={170} />
          <Field label="Quantitative" value={quant} onChange={setQuant} type="number" min={130} max={170} />
          <Field label="Writing" value={writing} onChange={setWriting} type="number" step="0.5" min={0} max={6} />
        </div>
        <FormActions saving={saving} submitLabel="Save scores" />
      </form>
    </div>
  );
}
