import { createClient } from "@/lib/supabase/server";
import { calculateReadiness } from "@/lib/readiness";
import { getQuickActions } from "@/lib/quickActions";
import {
  gpaLevel,
  scienceGpaLevel,
  shadowingLevel,
  icuMonthsLevel,
  BENCHMARK_TARGETS,
} from "@/lib/benchmarks";
import { calculateGPA, calculateScienceGPA } from "@/lib/gpa";
import {
  schoolStatusTone,
  componentTone,
  STATUS_TEXT_COLORS,
} from "@/lib/statusColors";
import Link from "next/link";
import BenchmarkStat from "@/components/ui/BenchmarkStat";
import SchoolAvatar from "@/components/ui/SchoolAvatar";
import StatusPill from "@/components/ui/StatusPill";
import styles from "./page.module.css";
import type {
  Course,
  ShadowingHour,
  Certification,
  HospitalUnit,
  AcademicProfile,
  LetterOfRec,
  Essay,
  School,
} from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const sixtyDaysOut = new Date(Date.now() + 60 * 86400000)
    .toISOString()
    .split("T")[0];

  const [
    coursesRes,
    schoolsRes,
    shadowingRes,
    certsRes,
    unitsRes,
    profileRes,
    lettersRes,
    essaysRes,
  ] = await Promise.all([
    supabase.from("courses").select("*"),
    supabase.from("schools").select("*"),
    supabase.from("shadowing_hours").select("*"),
    supabase.from("certifications").select("*"),
    supabase.from("hospital_units").select("*"),
    supabase.from("academic_profile").select("*").maybeSingle(),
    supabase.from("letters_of_rec").select("*"),
    supabase.from("essays").select("*"),
  ]);

  const courses: Course[] = coursesRes.data ?? [];
  const schools: School[] = schoolsRes.data ?? [];
  const shadowing: ShadowingHour[] = shadowingRes.data ?? [];
  const certifications: Certification[] = certsRes.data ?? [];
  const hospitalUnits: HospitalUnit[] = unitsRes.data ?? [];
  const academic: AcademicProfile | null = profileRes.data ?? null;
  const letters: LetterOfRec[] = lettersRes.data ?? [];
  const essays: Essay[] = essaysRes.data ?? [];

  const isEmpty =
    courses.length === 0 &&
    schools.length === 0 &&
    shadowing.length === 0 &&
    certifications.length === 0 &&
    hospitalUnits.length === 0 &&
    !academic;

  const snapshot = calculateReadiness({
    courses,
    certifications,
    shadowingHours: shadowing,
    hospitalUnits,
    academic,
    letters,
    essays,
    schools,
  });

  const overallGPA = calculateGPA(courses);
  const scienceGPA = calculateScienceGPA(courses);
  const totalShadowing = shadowing.reduce((sum, s) => sum + (s.hours ?? 0), 0);
  const icuMonths = calculateIcuMonths(hospitalUnits);

  // Build a readiness summary that adapts to profile completeness
  const missingCount = snapshot.components.filter((c) => c.status === "missing").length;
  const strongComponents = snapshot.components.filter((c) => c.status === "strong");
  const weakComponents = snapshot.components.filter((c) => c.status === "weak");

  let summarySentence: string;
  if (snapshot.completeness < 40) {
    summarySentence =
      "Score reflects what you've entered. Complete your profile for an accurate picture.";
  } else if (snapshot.completeness < 70) {
    const strongLabels = strongComponents.slice(0, 2).map((c) => c.label.toLowerCase());
    const strongPart =
      strongLabels.length > 0 ? `Strong ${strongLabels.join(", ")}` : "";
    const morePart = `Add ${missingCount} more section${missingCount === 1 ? "" : "s"} for full accuracy`;
    summarySentence = strongPart ? `${strongPart} · ${morePart}` : morePart;
  } else {
    const parts: string[] = [];
    if (strongComponents.length > 0) {
      parts.push(`Strong ${strongComponents[0].label.toLowerCase()}`);
    }
    for (const gap of weakComponents.slice(0, 3)) {
      parts.push(`${gap.label.toLowerCase()} gap`);
    }
    summarySentence = parts.join(" · ");
  }

  // Pipeline display: prioritize schools with upcoming deadlines, then by created date
  const pipelineSchools = [...schools]
    .sort((a, b) => {
      const aDate = a.application_deadline;
      const bDate = b.application_deadline;
      if (aDate && bDate) return aDate.localeCompare(bDate);
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      return 0;
    })
    .slice(0, 5);

  // Alerts
  const alerts: { text: string; href: string }[] = [];
  // Profile completeness alert (highest priority)
  if (snapshot.completeness < 40) {
    alerts.push({
      text: `Your profile is ${snapshot.completeness}% complete — add more sections for an accurate score`,
      href: "/academic",
    });
  }
  const overdueLetters = letters.filter(
    (l) => l.status !== "Received" && l.due_date && l.due_date < todayStr
  );
  if (overdueLetters.length > 0) {
    alerts.push({
      text: `${overdueLetters.length} letter${overdueLetters.length > 1 ? "s" : ""} past due`,
      href: "/more/letters",
    });
  }
  const expiringCerts = certifications.filter(
    (c) =>
      c.expiration_date &&
      c.expiration_date >= todayStr &&
      c.expiration_date <= sixtyDaysOut
  );
  if (expiringCerts.length > 0) {
    alerts.push({
      text: `${expiringCerts.length} cert${expiringCerts.length > 1 ? "s" : ""} expiring within 60 days`,
      href: "/certifications",
    });
  }
  const schoolsWithUpcoming = schools.filter(
    (s) =>
      s.application_deadline &&
      s.application_deadline >= todayStr &&
      s.application_deadline <= sixtyDaysOut
  );
  if (schoolsWithUpcoming.length > 0 && essays.length === 0) {
    alerts.push({
      text: `Essays not started for ${schoolsWithUpcoming.length} school${schoolsWithUpcoming.length > 1 ? "s" : ""} with upcoming deadlines`,
      href: "/more/essays",
    });
  }

  const quickActions = getQuickActions(snapshot, schoolsWithUpcoming.length);

  // Brand new user — minimal welcome
  if (isEmpty) {
    return (
      <div>
        <h1 className={styles.title}>Welcome.</h1>
        <p className={styles.welcomeBody}>
          Your CRNA application has a lot of moving parts. Path Tracker keeps
          them in one place — schools, GPA, shadowing, certifications, letters,
          essays, and everything else programs ask for.
        </p>
        <div className={styles.welcomeActions}>
          <Link href="/schools/new" className={styles.primaryBtn}>
            + Add your first school
          </Link>
          <Link href="/academic" className={styles.secondaryBtn}>
            Set up your academic profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Dashboard</h1>
        <span className={styles.dateLabel}>
          {today.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className={styles.alerts}>
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} className={styles.alert}>
              <span className={styles.alertDot} />
              <span>{a.text}</span>
              <span className={styles.alertArrow}>→</span>
            </Link>
          ))}
        </div>
      )}

      {/* Readiness — full width with soft tint */}
      <div className={styles.readinessCard}>
        <div className={styles.readinessLeft}>
          <div className={styles.readinessScore}>{snapshot.score}%</div>
        </div>
        <div className={styles.readinessRight}>
          <div className={styles.readinessLabel}>Application readiness</div>
          <div className={styles.readinessBar}>
            <div
              className={styles.readinessBarFill}
              style={{ width: `${snapshot.score}%` }}
            />
          </div>
          <div className={styles.readinessSummary}>{summarySentence}</div>
          <div className={styles.readinessCompleteness}>
            Based on {snapshot.completeness}% of your profile
          </div>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className={styles.stats}>
        <BenchmarkStat
          label="Overall GPA"
          value={overallGPA?.toFixed(2) ?? "—"}
          level={gpaLevel(overallGPA)}
          benchmark={BENCHMARK_TARGETS.gpa}
        />
        <BenchmarkStat
          label="Science GPA"
          value={scienceGPA?.toFixed(2) ?? "—"}
          level={scienceGpaLevel(scienceGPA)}
          benchmark={BENCHMARK_TARGETS.scienceGpa}
        />
        <BenchmarkStat
          label="ICU experience"
          value={icuMonths > 0 ? formatIcuYears(icuMonths) : "—"}
          level={icuMonthsLevel(icuMonths)}
          benchmark={BENCHMARK_TARGETS.icu}
          tooltip="Calculated from your hospital_units start and end dates. Roughly 1 year ≈ 2,080 hours full-time."
        />
        <BenchmarkStat
          label="Shadowing"
          value={`${totalShadowing} hrs`}
          level={shadowingLevel(totalShadowing)}
          benchmark={BENCHMARK_TARGETS.shadowing}
        />
      </div>

      {/* Two columns: School pipeline + Category progress */}
      <div className={styles.grid}>
        {/* School pipeline */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>School pipeline</span>
            <Link href="/schools" className={styles.viewAll}>
              View all →
            </Link>
          </div>
          {pipelineSchools.length === 0 ? (
            <div className={styles.panelEmpty}>
              <p>No schools added yet</p>
              <Link href="/schools/new" className={styles.addBtn}>
                + Add school
              </Link>
            </div>
          ) : (
            <div className={styles.pipelineList}>
              {pipelineSchools.map((s) => {
                const tone = schoolStatusTone(s.status);
                const daysLeft = s.application_deadline
                  ? Math.round(
                      (new Date(
                        s.application_deadline + "T00:00:00"
                      ).getTime() -
                        today.getTime()) /
                        86400000
                    )
                  : null;
                return (
                  <Link
                    key={s.id}
                    href={`/schools/${s.id}`}
                    className={styles.pipelineRow}
                  >
                    <SchoolAvatar name={s.program_name} size={40} />
                    <div className={styles.pipelineInfo}>
                      <div className={styles.pipelineName}>{s.program_name}</div>
                      {s.location && (
                        <div className={styles.pipelineLoc}>{s.location}</div>
                      )}
                    </div>
                    <div className={styles.pipelineRight}>
                      <StatusPill label={s.status} tone={tone} />
                      {s.rolling_admissions ? (
                        <div
                          className={styles.pipelineDeadline}
                          style={{ color: "var(--taupe)" }}
                        >
                          Rolling
                        </div>
                      ) : daysLeft !== null && daysLeft >= 0 ? (
                        <div
                          className={styles.pipelineDeadline}
                          style={{
                            color:
                              daysLeft <= 14
                                ? STATUS_TEXT_COLORS.danger
                                : daysLeft <= 30
                                ? STATUS_TEXT_COLORS.warn
                                : "var(--taupe)",
                          }}
                        >
                          {daysLeft === 0 ? "Due today" : `Due in ${daysLeft}d`}
                        </div>
                      ) : daysLeft !== null && daysLeft < 0 ? (
                        <div
                          className={styles.pipelineDeadline}
                          style={{ color: STATUS_TEXT_COLORS.danger }}
                        >
                          Past due
                        </div>
                      ) : (
                        <div className={styles.pipelineDeadlineEmpty}>
                          No deadline set
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
              <Link href="/schools/new" className={styles.addBtnGhost}>
                + Add school
              </Link>
            </div>
          )}
        </div>

        {/* Category progress */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Category progress</span>
          </div>
          <div className={styles.categoryList}>
            {snapshot.components
              .filter((c) => c.weight >= 0.05)
              .map((c) => {
                // Missing components are neutral (not red) — they're just unentered
                const tone =
                  c.status === "missing" ? "neutral" : componentTone(c.status);
                const statusText =
                  c.status === "strong"
                    ? "Strong"
                    : c.status === "ok"
                    ? "On track"
                    : c.status === "weak"
                    ? "Add detail"
                    : "Not entered";
                const displayPercent =
                  c.status === "missing" ? "—" : `${c.score}%`;
                const barColor = STATUS_TEXT_COLORS[tone];
                return (
                  <div key={c.label} className={styles.categoryRow}>
                    <div className={styles.categoryRowTop}>
                      <span className={styles.categoryLabel}>{c.label}</span>
                      <span className={styles.categoryPercent}>
                        {displayPercent}
                      </span>
                      <span
                        className={styles.categoryStatus}
                        style={{ color: barColor }}
                      >
                        {statusText}
                      </span>
                    </div>
                    <div className={styles.categoryBar}>
                      <div
                        className={styles.categoryBarFill}
                        style={{
                          width: `${c.status === "missing" ? 0 : c.score}%`,
                          background: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Next actions */}
      <div className={styles.nextActions}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Next actions</span>
        </div>
        <div className={styles.actionList}>
          {quickActions.map((a, i) => (
            <Link key={i} href={a.href} className={styles.actionCard}>
              <span className={styles.actionDot} />
              <div>
                <div className={styles.actionLabel}>{a.label}</div>
                <div className={styles.actionDesc}>{a.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
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

function formatIcuYears(months: number): string {
  const years = months / 12;
  if (years < 1) {
    return `${months} mo`;
  }
  if (years === Math.floor(years)) {
    return `${years} yr${years === 1 ? "" : "s"}`;
  }
  return `${years.toFixed(1)} yrs`;
}
