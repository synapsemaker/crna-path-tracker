// Application readiness score — composite 0-100
// Weighted across the major application components

import type { Course, Certification, ShadowingHour, HospitalUnit, AcademicProfile, LetterOfRec, Essay, School } from "./types";
import { calculateGPA, calculateScienceGPA } from "./gpa";

export type ReadinessSnapshot = {
  score: number; // 0-100, calculated only on completed sections
  completeness: number; // 0-100, how much of the profile is filled in
  components: ReadinessComponent[];
  primaryGap: string | null;
};

export type ReadinessComponent = {
  label: string;
  score: number; // 0-100 for this component
  weight: number; // 0-1
  status: "missing" | "weak" | "ok" | "strong";
  detail: string;
};

type Inputs = {
  courses: Course[];
  certifications: Certification[];
  shadowingHours: ShadowingHour[];
  hospitalUnits: HospitalUnit[];
  academic: AcademicProfile | null;
  letters: LetterOfRec[];
  essays: Essay[];
  schools: School[];
};

export function calculateReadiness(inputs: Inputs): ReadinessSnapshot {
  const components: ReadinessComponent[] = [];

  // 1. GPA (weight: 0.20)
  const gpa = calculateGPA(inputs.courses);
  const gpaScore =
    gpa === null ? 0 : gpa >= 3.7 ? 100 : gpa >= 3.5 ? 80 : gpa >= 3.0 ? 60 : 30;
  components.push({
    label: "GPA",
    score: gpaScore,
    weight: 0.2,
    status: gpa === null ? "missing" : gpa >= 3.5 ? "strong" : gpa >= 3.0 ? "ok" : "weak",
    detail: gpa === null ? "Add courses to calculate" : `${gpa.toFixed(2)} overall`,
  });

  // 2. Science GPA (weight: 0.10)
  const sciGpa = calculateScienceGPA(inputs.courses);
  const sciScore =
    sciGpa === null ? 0 : sciGpa >= 3.7 ? 100 : sciGpa >= 3.5 ? 80 : sciGpa >= 3.0 ? 60 : 30;
  components.push({
    label: "Science GPA",
    score: sciScore,
    weight: 0.1,
    status: sciGpa === null ? "missing" : sciGpa >= 3.5 ? "strong" : sciGpa >= 3.0 ? "ok" : "weak",
    detail: sciGpa === null ? "Mark science courses" : `${sciGpa.toFixed(2)}`,
  });

  // 3. ICU experience (weight: 0.20)
  const icuMonths = calculateIcuMonths(inputs.hospitalUnits);
  const icuScore =
    icuMonths === 0 ? 0 : icuMonths >= 24 ? 100 : icuMonths >= 18 ? 80 : icuMonths >= 12 ? 60 : 30;
  components.push({
    label: "ICU experience",
    score: icuScore,
    weight: 0.2,
    status: icuMonths === 0 ? "missing" : icuMonths >= 18 ? "strong" : icuMonths >= 12 ? "ok" : "weak",
    detail:
      icuMonths === 0
        ? "Add your first role"
        : `${Math.round(icuMonths)} months`,
  });

  // 4. Shadowing hours (weight: 0.10)
  const shadowingHours = inputs.shadowingHours.reduce(
    (sum, h) => sum + (h.hours ?? 0),
    0
  );
  const shadowScore =
    shadowingHours === 0
      ? 0
      : shadowingHours >= 40
      ? 100
      : shadowingHours >= 20
      ? 80
      : shadowingHours >= 8
      ? 60
      : 30;
  components.push({
    label: "Shadowing",
    score: shadowScore,
    weight: 0.1,
    status:
      shadowingHours === 0
        ? "missing"
        : shadowingHours >= 20
        ? "strong"
        : shadowingHours >= 8
        ? "ok"
        : "weak",
    detail: shadowingHours === 0 ? "Log your first shift" : `${shadowingHours} hours`,
  });

  // 5. CCRN (weight: 0.15)
  const ccrn = inputs.certifications.find((c) => c.name === "CCRN");
  const ccrnScore = !ccrn
    ? 0
    : ccrn.status === "Active"
    ? 100
    : ccrn.status === "In Progress"
    ? 60
    : 0;
  components.push({
    label: "CCRN",
    score: ccrnScore,
    weight: 0.15,
    status:
      !ccrn ? "missing" : ccrn.status === "Active" ? "strong" : ccrn.status === "In Progress" ? "ok" : "weak",
    detail: !ccrn ? "Required by most programs" : ccrn.status,
  });

  // 6. GRE (weight: 0.10) — only if user has it
  const gre = inputs.academic;
  const greEntered =
    gre && (gre.gre_verbal || gre.gre_quantitative || gre.gre_writing);
  const greAvg = greEntered
    ? ((gre.gre_verbal ?? 150) + (gre.gre_quantitative ?? 150)) / 2
    : 0;
  const greScore =
    !greEntered ? 50 // neutral — not all programs require it
    : greAvg >= 155
    ? 100
    : greAvg >= 150
    ? 80
    : greAvg >= 145
    ? 60
    : 30;
  components.push({
    label: "GRE",
    score: greScore,
    weight: 0.1,
    status: !greEntered ? "ok" : greAvg >= 150 ? "strong" : greAvg >= 145 ? "ok" : "weak",
    detail: !greEntered ? "Optional for many programs" : `V${gre?.gre_verbal ?? "—"} Q${gre?.gre_quantitative ?? "—"}`,
  });

  // 7. Schools added (weight: 0.05)
  const schoolCount = inputs.schools.length;
  const schoolScore =
    schoolCount === 0 ? 0 : schoolCount >= 5 ? 100 : schoolCount >= 3 ? 80 : 50;
  components.push({
    label: "Schools",
    score: schoolScore,
    weight: 0.05,
    status: schoolCount === 0 ? "missing" : schoolCount >= 3 ? "strong" : "ok",
    detail: `${schoolCount} added`,
  });

  // 8. Letters of rec (weight: 0.05)
  const lettersReceived = inputs.letters.filter(
    (l) => l.status === "Received"
  ).length;
  const lettersInProgress = inputs.letters.filter(
    (l) => l.status === "Pending" || l.status === "Submitted"
  ).length;
  const lettersScore =
    lettersReceived >= 3
      ? 100
      : lettersReceived >= 2
      ? 70
      : lettersReceived >= 1 || lettersInProgress >= 2
      ? 40
      : inputs.letters.length === 0
      ? 0
      : 20;
  components.push({
    label: "Letters",
    score: lettersScore,
    weight: 0.05,
    status:
      inputs.letters.length === 0
        ? "missing"
        : lettersReceived >= 3
        ? "strong"
        : lettersReceived >= 1
        ? "ok"
        : "weak",
    detail: `${lettersReceived} received · ${lettersInProgress} pending`,
  });

  // 9. Essays (weight: 0.05)
  const essaysSubmitted = inputs.essays.filter(
    (e) => e.status === "Submitted"
  ).length;
  const essaysProgress = inputs.essays.filter(
    (e) => e.status !== "Brainstorm"
  ).length;
  const essayScore =
    inputs.essays.length === 0
      ? 0
      : essaysSubmitted >= inputs.schools.length
      ? 100
      : essaysProgress > 0
      ? 50
      : 20;
  components.push({
    label: "Essays",
    score: essayScore,
    weight: 0.05,
    status:
      inputs.essays.length === 0
        ? "missing"
        : essaysSubmitted > 0
        ? "strong"
        : essaysProgress > 0
        ? "ok"
        : "weak",
    detail: `${essaysSubmitted} submitted · ${inputs.essays.length - essaysSubmitted} drafting`,
  });

  // Score only counts components the user has actually entered data for.
  // "missing" components don't penalize the score — they reduce completeness.
  const filled = components.filter((c) => c.status !== "missing");
  const filledWeight = filled.reduce((sum, c) => sum + c.weight, 0);
  const score =
    filled.length === 0
      ? 0
      : Math.round(
          filled.reduce((sum, c) => sum + c.score * c.weight, 0) / filledWeight
        );

  // Completeness: what fraction of the profile (by weight) is filled in
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const completeness = Math.round((filledWeight / totalWeight) * 100);

  // Find primary gap — prefer missing components first (they reduce completeness),
  // then weak components (they hurt the score)
  const missing = components
    .filter((c) => c.status === "missing")
    .sort((a, b) => b.weight - a.weight);
  const weak = components
    .filter((c) => c.status === "weak")
    .sort((a, b) => b.weight - a.weight || a.score - b.score);
  const primaryGap = (missing[0] ?? weak[0])?.label ?? null;

  return { score, completeness, components, primaryGap };
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
