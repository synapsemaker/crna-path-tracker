"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { School, Course, Certification, AcademicProfile, HospitalUnit, LetterOfRec, Essay, ShadowingHour } from "@/lib/types";
import { fetchCatalogProgramById } from "@/lib/catalog-actions";
import {
  evaluateRequirementGroup,
  evaluateCriticalCare,
  type CatalogProgram,
} from "@/lib/catalog";
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

      const [schoolRes, coursesRes, certsRes, profileRes, unitsRes, lettersRes, essaysRes, shadowingRes] =
        await Promise.all([
          supabase.from("schools").select("*").eq("id", params.id).single(),
          supabase.from("courses").select("*"),
          supabase.from("certifications").select("*"),
          supabase.from("academic_profile").select("*").maybeSingle(),
          supabase.from("hospital_units").select("*"),
          supabase.from("letters_of_rec").select("*"),
          supabase.from("essays").select("*"),
          supabase.from("shadowing_hours").select("*"),
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
      const shadowing: ShadowingHour[] = shadowingRes.data ?? [];

      const userGpa = calculateGPA(courses);
      const icuMonths = calculateIcuMonths(units);
      const ccrn = certs.find((c) => c.name === "CCRN");
      const lettersForSchool = letters.filter(
        (l) => l.school_name && s.program_name && l.school_name.toLowerCase().includes(s.program_name.toLowerCase().split(" ")[0])
      );
      const essaysForSchool = essays.filter(
        (e) => e.school_name && s.program_name && e.school_name.toLowerCase().includes(s.program_name.toLowerCase().split(" ")[0])
      );

      // If this school was sourced from the End Tidal catalog, fetch the
      // canonical program so we can evaluate its requirement groups (the
      // OR-aware admission rules: "CCRN OR PCCN", "1y ICU OR 2y ED", etc.).
      // Falls back to the school's stored flat fields when no catalog link.
      let catalogProgram: CatalogProgram | null = null;
      if (s.source_program_id) {
        try {
          catalogProgram = await fetchCatalogProgramById(s.source_program_id);
        } catch (err) {
          console.warn("Catalog fetch failed:", err);
        }
      }

      // Build user-data inputs for requirement group evaluation (prereqs + certs only)
      const userDataForGroups = {
        completedCourses: new Set<string>(
          courses
            .filter((c) => c.status === "completed" || c.status === "in_progress")
            .map((c) => c.course_name.toLowerCase().replace(/\s+/g, "_"))
        ),
        activeCerts: new Set<string>(
          certs
            .filter((c) => c.status === "Active")
            .map((c) => c.name.toUpperCase())
        ),
      };

      const newChecks: Check[] = [];

      // GPA — always uses the school's stored value (no group equivalent)
      if (s.min_gpa !== null) {
        const met = userGpa !== null && userGpa >= s.min_gpa;
        newChecks.push({
          label: `GPA ≥ ${s.min_gpa}`,
          met: userGpa === null ? null : met,
          detail: userGpa === null ? "No courses entered" : `Your GPA: ${userGpa.toFixed(2)}`,
        });
      }

      if (catalogProgram) {
        // Catalog-driven path

        // Critical care experience (uses the program's accept_* exclusions)
        const ccCheck = evaluateCriticalCare(
          catalogProgram,
          aggregateQualifyingCriticalCare(units, catalogProgram)
        );
        if (ccCheck) newChecks.push(ccCheck);

        // Prereqs + certs requirement groups
        for (const group of catalogProgram.requirements) {
          if (group.severity !== "required") continue; // skip "recommended"
          const result = evaluateRequirementGroup(group, userDataForGroups);
          newChecks.push({
            label: result.label,
            met: result.met,
            detail: result.detail,
          });
        }
      } else {
        // Fallback path: school has no catalog link or no groups defined.
        // Use the flat fields stored on the school row directly.

        // GRE — only if the program actually requires it
        if (s.requires_gre) {
          if (s.min_gre_verbal !== null) {
            const verbal = profile?.gre_verbal ?? null;
            newChecks.push({
              label: `GRE Verbal ≥ ${s.min_gre_verbal}`,
              met: verbal === null ? null : verbal >= s.min_gre_verbal,
              detail: verbal === null ? "Not entered" : `Your score: ${verbal}`,
            });
          }
          if (s.min_gre_quantitative !== null) {
            const quant = profile?.gre_quantitative ?? null;
            newChecks.push({
              label: `GRE Quant ≥ ${s.min_gre_quantitative}`,
              met: quant === null ? null : quant >= s.min_gre_quantitative,
              detail: quant === null ? "Not entered" : `Your score: ${quant}`,
            });
          }
          if (s.min_gre_verbal === null && s.min_gre_quantitative === null) {
            const profileEntered = profile && (profile.gre_verbal || profile.gre_quantitative);
            newChecks.push({
              label: "GRE required",
              met: profileEntered ? true : null,
              detail: profileEntered ? "Score entered" : "Add GRE scores in Academic",
            });
          }
        }

        // ICU experience (years)
        if (s.icu_years_required !== null) {
          const userYears = icuMonths / 12;
          newChecks.push({
            label: `${s.icu_years_required} ICU year${s.icu_years_required === 1 ? "" : "s"}`,
            met: userYears >= s.icu_years_required,
            detail:
              icuMonths === 0
                ? "No experience added"
                : `${userYears.toFixed(1)} years (${icuMonths} months)`,
          });
        }

        // Shadowing
        if (s.min_shadowing_hours !== null) {
          const totalShadowingHours = shadowing.reduce((sum, sh) => sum + (sh.hours ?? 0), 0);
          newChecks.push({
            label: `${s.min_shadowing_hours} shadowing hours`,
            met: totalShadowingHours >= s.min_shadowing_hours,
            detail:
              totalShadowingHours === 0
                ? "No shadowing logged"
                : `${totalShadowingHours} hours logged`,
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
    { label: "Location", value: school.location },
    { label: "Degree", value: school.degree_type },
    { label: "Length", value: school.program_length },
    {
      label: "Deadline",
      value: school.rolling_admissions
        ? "Rolling admissions"
        : school.application_deadline,
    },
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
        title={school.program_name}
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

// Aggregate critical care experience that QUALIFIES for a specific
// program. Walks the user's hospital_units rows, classifies each by
// unit name, and excludes any unit type the program rejects.
//
// Returns total qualifying years plus a per-type breakdown for the
// checklist detail line.
type ProgramExclusions = {
  accepts_er: boolean;
  accepts_pacu: boolean;
  accepts_nicu: boolean;
  accepts_picu: boolean;
};

function aggregateQualifyingCriticalCare(
  units: HospitalUnit[],
  program: ProgramExclusions
): { totalQualifyingYears: number; breakdown: { type: string; years: number }[] } {
  const tally: Record<string, number> = {};
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
    if (months <= 0) continue;
    const years = months / 12;

    const name = (unit.unit_name ?? "").toLowerCase();
    // Classify the unit. Anything matching a critical-care keyword is
    // considered qualifying — adult ICU/CCU/CVICU/trauma always count;
    // ER/PACU/NICU/PICU only count if the program accepts them.
    let type = "icu"; // default — generic ICU
    if (/nicu/.test(name)) type = "nicu";
    else if (/picu/.test(name)) type = "picu";
    else if (/\b(er|ed|emergency)\b/.test(name)) type = "er";
    else if (/pacu/.test(name)) type = "pacu";
    else if (/cvicu/.test(name)) type = "cvicu";
    else if (/\bccu\b/.test(name)) type = "ccu";
    else if (/trauma/.test(name)) type = "trauma";
    else if (/step.?down/.test(name)) type = "step_down";

    // Apply program exclusions for the four toggleable subtypes
    const excluded =
      (type === "er" && !program.accepts_er) ||
      (type === "pacu" && !program.accepts_pacu) ||
      (type === "nicu" && !program.accepts_nicu) ||
      (type === "picu" && !program.accepts_picu) ||
      type === "step_down"; // step-down is not critical care
    if (excluded) continue;

    tally[type] = (tally[type] ?? 0) + years;
  }
  const breakdown = Object.entries(tally)
    .map(([type, years]) => ({ type, years }))
    .sort((a, b) => b.years - a.years);
  const totalQualifyingYears = breakdown.reduce((sum, b) => sum + b.years, 0);
  return { totalQualifyingYears, breakdown };
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
