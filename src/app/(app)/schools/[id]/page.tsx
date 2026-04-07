"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { School, Course, Certification, AcademicProfile, HospitalUnit, LetterOfRec, Essay } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SchoolForm from "@/components/schools/SchoolForm";
import StatusBadge from "@/components/ui/StatusBadge";
import { calculateGPA } from "@/lib/gpa";
import styles from "../page.module.css";

type Check = {
  label: string;
  met: boolean | null; // null = not applicable / can't determine
  detail: string;
};

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [school, setSchool] = useState<School | null>(null);
  const [userId, setUserId] = useState("");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const [schoolRes, coursesRes, certsRes, profileRes, unitsRes, lettersRes, essaysRes] =
        await Promise.all([
          supabase.from("schools").select("*").eq("id", params.id).single(),
          supabase.from("courses").select("*"),
          supabase.from("certifications").select("*"),
          supabase.from("academic_profile").select("*").maybeSingle(),
          supabase.from("hospital_units").select("*"),
          supabase.from("letters_of_rec").select("*"),
          supabase.from("essays").select("*"),
        ]);

      const s: School | null = schoolRes.data;
      setSchool(s);
      if (!s) return;

      const courses: Course[] = coursesRes.data ?? [];
      const certs: Certification[] = certsRes.data ?? [];
      const profile: AcademicProfile | null = profileRes.data ?? null;
      const units: HospitalUnit[] = unitsRes.data ?? [];
      const letters: LetterOfRec[] = lettersRes.data ?? [];
      const essays: Essay[] = essaysRes.data ?? [];

      const userGpa = calculateGPA(courses);
      const icuMonths = calculateIcuMonths(units);
      const ccrn = certs.find((c) => c.name === "CCRN");
      const lettersForSchool = letters.filter(
        (l) => l.school_name && s.name && l.school_name.toLowerCase().includes(s.name.toLowerCase().split(" ")[0])
      );
      const essaysForSchool = essays.filter(
        (e) => e.school_name && s.name && e.school_name.toLowerCase().includes(s.name.toLowerCase().split(" ")[0])
      );

      const newChecks: Check[] = [];

      // GPA
      if (s.min_gpa !== null) {
        const met = userGpa !== null && userGpa >= s.min_gpa;
        newChecks.push({
          label: `GPA ≥ ${s.min_gpa}`,
          met: userGpa === null ? null : met,
          detail: userGpa === null ? "No courses entered" : `Your GPA: ${userGpa.toFixed(2)}`,
        });
      }

      // GRE Verbal
      if (s.min_gre_verbal !== null) {
        const verbal = profile?.gre_verbal ?? null;
        newChecks.push({
          label: `GRE Verbal ≥ ${s.min_gre_verbal}`,
          met: verbal === null ? null : verbal >= s.min_gre_verbal,
          detail: verbal === null ? "Not entered" : `Your score: ${verbal}`,
        });
      }

      // GRE Quant
      if (s.min_gre_quantitative !== null) {
        const quant = profile?.gre_quantitative ?? null;
        newChecks.push({
          label: `GRE Quant ≥ ${s.min_gre_quantitative}`,
          met: quant === null ? null : quant >= s.min_gre_quantitative,
          detail: quant === null ? "Not entered" : `Your score: ${quant}`,
        });
      }

      // ICU hours (using months as proxy — most schools state hours but we track months)
      if (s.min_icu_hours !== null) {
        // Rough conversion: 1 month FT ≈ 160 hours
        const userHours = icuMonths * 160;
        newChecks.push({
          label: `${s.min_icu_hours} ICU hours`,
          met: userHours >= s.min_icu_hours,
          detail: icuMonths === 0 ? "No experience added" : `~${userHours} hours (${icuMonths} months)`,
        });
      }

      // CCRN
      if (s.requires_ccrn) {
        newChecks.push({
          label: "CCRN required",
          met: !!ccrn && ccrn.status === "Active",
          detail: !ccrn ? "Not added" : ccrn.status,
        });
      }

      // Letters
      newChecks.push({
        label: "Letters of recommendation",
        met: lettersForSchool.length >= 3,
        detail: `${lettersForSchool.length} linked to this school`,
      });

      // Essays
      newChecks.push({
        label: "Essays",
        met: essaysForSchool.some((e) => e.status === "Submitted"),
        detail:
          essaysForSchool.length === 0
            ? "Not started"
            : `${essaysForSchool.filter((e) => e.status === "Submitted").length} submitted, ${essaysForSchool.length - essaysForSchool.filter((e) => e.status === "Submitted").length} in progress`,
      });

      setChecks(newChecks);
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
    { label: "Website", value: school.website },
  ].filter((f) => f.value !== null && f.value !== undefined);

  const metCount = checks.filter((c) => c.met === true).length;
  const totalCount = checks.length;

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

      <div style={{ marginBottom: 24 }}>
        <StatusBadge status={school.status} />
      </div>

      {/* Requirements checklist */}
      {checks.length > 0 && (
        <div
          style={{
            border: "1px solid var(--warm-rule)",
            background: "var(--cream)",
            padding: "20px 24px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--taupe)",
              }}
            >
              Requirements checklist
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                color: "var(--ink)",
              }}
            >
              {metCount} / {totalCount} met
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {checks.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom:
                    i < checks.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: `1.5px solid ${c.met === true ? "#3a7d44" : c.met === false ? "#a05050" : "var(--warm-rule)"}`,
                    background: c.met === true ? "#3a7d44" : "transparent",
                    color: "var(--cream)",
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {c.met === true ? "✓" : c.met === false ? "" : "?"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      color: "var(--ink)",
                    }}
                  >
                    {c.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "var(--taupe)",
                    }}
                  >
                    {c.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 24px",
        }}
      >
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
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ink)",
              }}
            >
              {String(f.value)}
            </div>
          </div>
        ))}
      </div>

      {school.notes && (
        <div
          style={{
            marginTop: 24,
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
          }}
        >
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
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--ink)",
              lineHeight: 1.6,
            }}
          >
            {school.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function calculateIcuMonths(units: HospitalUnit[]): number {
  let totalMonths = 0;
  const now = new Date();
  for (const unit of units) {
    if (!unit.start_date) continue;
    const start = new Date(unit.start_date);
    const end = unit.current
      ? now
      : unit.end_date
      ? new Date(unit.end_date)
      : null;
    if (!end) continue;
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (months > 0) totalMonths += months;
  }
  return totalMonths;
}
