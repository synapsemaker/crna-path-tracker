"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { School } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SchoolForm from "@/components/schools/SchoolForm";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "../page.module.css";

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [school, setSchool] = useState<School | null>(null);
  const [userId, setUserId] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      const { data } = await supabase
        .from("schools")
        .select("*")
        .eq("id", params.id)
        .single();
      setSchool(data);
    }
    load();
  }, [params.id, supabase]);

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("schools").delete().eq("id", params.id);
    router.push("/schools");
    router.refresh();
  }

  if (!school) return null;

  if (editing) {
    return (
      <div>
        <PageHeader title="Edit School" />
        <SchoolForm school={school} userId={userId} />
      </div>
    );
  }

  const fields = [
    { label: "Program", value: school.program_name },
    { label: "Location", value: school.location },
    { label: "Degree", value: school.degree_type },
    { label: "Length", value: school.program_length },
    { label: "Deadline", value: school.application_deadline },
    { label: "Interview", value: school.interview_date },
    { label: "Decision", value: school.decision_date },
    { label: "Deposit due", value: school.deposit_due },
    { label: "App fee", value: school.app_fee ? `$${school.app_fee}` : null },
    { label: "Tuition", value: school.tuition ? `$${school.tuition.toLocaleString()}` : null },
    { label: "Min GPA", value: school.min_gpa },
    { label: "Min GRE V", value: school.min_gre_verbal },
    { label: "Min GRE Q", value: school.min_gre_quantitative },
    { label: "Min ICU hrs", value: school.min_icu_hours },
    { label: "Requires CCRN", value: school.requires_ccrn ? "Yes" : "No" },
    { label: "Website", value: school.website },
  ].filter((f) => f.value !== null && f.value !== undefined);

  return (
    <div>
      <PageHeader
        title={school.name}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(true)} className={styles.addBtn}>
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#a05050",
                background: "none",
                border: "1px solid #a05050",
                padding: "10px 18px",
                cursor: "pointer",
                opacity: deleting ? 0.5 : 1,
              }}
            >
              Delete
            </button>
          </div>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <StatusBadge status={school.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
        {fields.map((f) => (
          <div key={f.label}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--taupe)",
                marginBottom: 4,
              }}
            >
              {f.label}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}>
              {String(f.value)}
            </div>
          </div>
        ))}
      </div>

      {school.notes && (
        <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--taupe)",
              marginBottom: 6,
            }}
          >
            Notes
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>
            {school.notes}
          </p>
        </div>
      )}
    </div>
  );
}
