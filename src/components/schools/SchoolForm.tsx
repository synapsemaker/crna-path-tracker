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
};

export default function SchoolForm({ school, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(school?.name ?? "");
  const [programName, setProgramName] = useState(school?.program_name ?? "");
  const [location, setLocation] = useState(school?.location ?? "");
  const [degreeType, setDegreeType] = useState(school?.degree_type ?? "");
  const [programLength, setProgramLength] = useState(school?.program_length ?? "");
  const [deadline, setDeadline] = useState(school?.application_deadline ?? "");
  const [interviewDate, setInterviewDate] = useState(school?.interview_date ?? "");
  const [decisionDate, setDecisionDate] = useState(school?.decision_date ?? "");
  const [depositDue, setDepositDue] = useState(school?.deposit_due ?? "");
  const [appFee, setAppFee] = useState(school?.app_fee?.toString() ?? "");
  const [minGpa, setMinGpa] = useState(school?.min_gpa?.toString() ?? "");
  const [minGreVerbal, setMinGreVerbal] = useState(school?.min_gre_verbal?.toString() ?? "");
  const [minGreQuant, setMinGreQuant] = useState(school?.min_gre_quantitative?.toString() ?? "");
  const [minIcuHours, setMinIcuHours] = useState(school?.min_icu_hours?.toString() ?? "");
  const [requiresCcrn, setRequiresCcrn] = useState(school?.requires_ccrn ?? false);
  const [tuition, setTuition] = useState(school?.tuition?.toString() ?? "");
  const [website, setWebsite] = useState(school?.website ?? "");
  const [notes, setNotes] = useState(school?.notes ?? "");
  const [status, setStatus] = useState<string>(school?.status ?? "Researching");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      user_id: userId,
      name,
      program_name: programName || null,
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
      min_icu_hours: minIcuHours ? parseInt(minIcuHours) : null,
      requires_ccrn: requiresCcrn,
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
      <div className={styles.grid}>
        <Field label="School name" value={name} onChange={setName} required />
        <Field label="Program name" value={programName} onChange={setProgramName} placeholder="e.g. DNP Nurse Anesthesia" />
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

      <div className={styles.divider} />

      <div className={styles.grid}>
        <Field label="Application fee" value={appFee} onChange={setAppFee} type="number" placeholder="$" step="0.01" />
        <Field label="Tuition" value={tuition} onChange={setTuition} type="number" placeholder="$" step="0.01" />
        <Field label="Min GPA" value={minGpa} onChange={setMinGpa} type="number" step="0.01" min={0} max={4} />
        <Field label="Min GRE Verbal" value={minGreVerbal} onChange={setMinGreVerbal} type="number" />
        <Field label="Min GRE Quantitative" value={minGreQuant} onChange={setMinGreQuant} type="number" />
        <Field label="Min ICU hours" value={minIcuHours} onChange={setMinIcuHours} type="number" />
      </div>

      <div style={{ marginTop: 16 }}>
        <CheckboxField label="Requires CCRN" checked={requiresCcrn} onChange={setRequiresCcrn} />
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
