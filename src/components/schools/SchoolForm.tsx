"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SCHOOL_STATUSES } from "@/lib/constants";
import type { School } from "@/lib/types";
import Field from "@/components/forms/Field";
import SelectField from "@/components/forms/SelectField";
import TextareaField from "@/components/forms/TextareaField";
import CheckboxField from "@/components/forms/CheckboxField";
import FormActions from "@/components/forms/FormActions";
import styles from "./SchoolForm.module.css";

type Props = {
  school?: School;
  userId: string;
  prefilledData?: Partial<School>;
};

export default function SchoolForm({ school, userId, prefilledData }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [programName, setProgramName] = useState(
    school?.program_name ?? prefilledData?.program_name ?? ""
  );
  const [location, setLocation] = useState(
    school?.location ?? prefilledData?.location ?? ""
  );
  const [degreeType, setDegreeType] = useState(
    school?.degree_type ?? prefilledData?.degree_type ?? ""
  );
  const [programLength, setProgramLength] = useState(
    school?.program_length ?? prefilledData?.program_length ?? ""
  );
  const [deadline, setDeadline] = useState(
    school?.application_deadline ?? prefilledData?.application_deadline ?? ""
  );
  const [interviewDate, setInterviewDate] = useState(school?.interview_date ?? "");
  const [decisionDate, setDecisionDate] = useState(school?.decision_date ?? "");
  const [depositDue, setDepositDue] = useState(school?.deposit_due ?? "");
  const [appFee, setAppFee] = useState(
    school?.app_fee?.toString() ?? prefilledData?.app_fee?.toString() ?? ""
  );
  const [minGpa, setMinGpa] = useState(
    school?.min_gpa?.toString() ?? prefilledData?.min_gpa?.toString() ?? ""
  );
  const [minGreVerbal, setMinGreVerbal] = useState(
    school?.min_gre_verbal?.toString() ?? prefilledData?.min_gre_verbal?.toString() ?? ""
  );
  const [minGreQuant, setMinGreQuant] = useState(
    school?.min_gre_quantitative?.toString() ?? prefilledData?.min_gre_quantitative?.toString() ?? ""
  );
  const [icuYearsRequired, setIcuYearsRequired] = useState(
    school?.icu_years_required?.toString() ?? prefilledData?.icu_years_required?.toString() ?? ""
  );
  const [requiresCcrn, setRequiresCcrn] = useState(
    school?.requires_ccrn ?? prefilledData?.requires_ccrn ?? false
  );
  const [requiresGre, setRequiresGre] = useState(
    school?.requires_gre ?? prefilledData?.requires_gre ?? false
  );
  const [minShadowingHours, setMinShadowingHours] = useState(
    school?.min_shadowing_hours?.toString() ?? prefilledData?.min_shadowing_hours?.toString() ?? ""
  );
  const [rollingAdmissions, setRollingAdmissions] = useState(
    school?.rolling_admissions ?? prefilledData?.rolling_admissions ?? false
  );
  const [tuition, setTuition] = useState(
    school?.tuition?.toString() ?? prefilledData?.tuition?.toString() ?? ""
  );
  const [website, setWebsite] = useState(
    school?.website ?? prefilledData?.website ?? ""
  );
  const [notes, setNotes] = useState(school?.notes ?? "");
  const [status, setStatus] = useState<string>(
    school?.status ?? prefilledData?.status ?? "Researching"
  );

  const sourceProgramId = school?.source_program_id ?? prefilledData?.source_program_id ?? null;
  const showPrefillBanner = !school && prefilledData != null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      user_id: userId,
      program_name: programName,
      location: location || null,
      degree_type: degreeType || null,
      program_length: programLength || null,
      application_deadline: deadline || null,
      interview_date: interviewDate || null,
      decision_date: decisionDate || null,
      deposit_due: depositDue || null,
      app_fee: appFee ? parseFloat(appFee) : null,
      min_gpa: minGpa ? parseFloat(minGpa) : null,
      min_gre_verbal: minGreVerbal ? parseInt(minGreVerbal) : null,
      min_gre_quantitative: minGreQuant ? parseInt(minGreQuant) : null,
      icu_years_required: icuYearsRequired ? parseFloat(icuYearsRequired) : null,
      requires_ccrn: requiresCcrn,
      requires_gre: requiresGre,
      min_shadowing_hours: minShadowingHours ? parseInt(minShadowingHours) : null,
      rolling_admissions: rollingAdmissions,
      source_program_id: sourceProgramId,
      tuition: tuition ? parseFloat(tuition) : null,
      website: website || null,
      notes: notes || null,
      status,
    };

    const result = school
      ? await supabase.from("schools").update(data).eq("id", school.id)
      : await supabase.from("schools").insert(data);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    router.push("/schools");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      {showPrefillBanner && (
        <div className={styles.prefillBanner}>
          Pre-filled from CRNA Finder. You can edit any field before saving.
        </div>
      )}

      <div className={styles.grid}>
        <Field
          label="Program name"
          value={programName}
          onChange={setProgramName}
          required
          placeholder="e.g. Texas Wesleyan University Graduate Programs of Nurse Anesthesia"
        />
        <Field label="Location" value={location} onChange={setLocation} placeholder="City, State" />
        <Field label="Degree type" value={degreeType} onChange={setDegreeType} placeholder="DNP, DNAP, etc." />
        <Field label="Program length" value={programLength} onChange={setProgramLength} placeholder="e.g. 36 months" />
        <SelectField label="Status" value={status} onChange={setStatus} options={SCHOOL_STATUSES} />
      </div>

      <div className={styles.divider} />

      <div className={styles.grid}>
        <Field label="Application deadline" value={deadline} onChange={setDeadline} type="date" />
        <Field label="Interview date" value={interviewDate} onChange={setInterviewDate} type="date" />
        <Field label="Decision date" value={decisionDate} onChange={setDecisionDate} type="date" />
        <Field label="Deposit due" value={depositDue} onChange={setDepositDue} type="date" />
      </div>

      <div style={{ marginTop: 16 }}>
        <CheckboxField
          label="Rolling admissions (no fixed deadline)"
          checked={rollingAdmissions}
          onChange={setRollingAdmissions}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.grid}>
        <Field label="Application fee" value={appFee} onChange={setAppFee} type="number" placeholder="$" step="0.01" />
        <Field label="Tuition" value={tuition} onChange={setTuition} type="number" placeholder="$" step="0.01" />
        <Field label="Min GPA" value={minGpa} onChange={setMinGpa} type="number" step="0.01" min={0} max={4} />
        <Field label="Min GRE Verbal" value={minGreVerbal} onChange={setMinGreVerbal} type="number" />
        <Field label="Min GRE Quantitative" value={minGreQuant} onChange={setMinGreQuant} type="number" />
        <Field label="ICU years required" value={icuYearsRequired} onChange={setIcuYearsRequired} type="number" step="0.5" min={0} placeholder="e.g. 1" />
        <Field label="Min shadowing hours" value={minShadowingHours} onChange={setMinShadowingHours} type="number" />
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <CheckboxField label="Requires CCRN" checked={requiresCcrn} onChange={setRequiresCcrn} />
        <CheckboxField label="Requires GRE" checked={requiresGre} onChange={setRequiresGre} />
      </div>

      <div className={styles.divider} />

      <Field label="Website" value={website} onChange={setWebsite} type="url" placeholder="https://" />
      <div style={{ marginTop: 12 }}>
        <TextareaField label="Notes" value={notes} onChange={setNotes} placeholder="Anything to remember about this program" />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      <FormActions saving={saving} onCancel={() => router.back()} />
    </form>
  );
}
