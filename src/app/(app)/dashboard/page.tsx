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

  // Build a one-line readiness summary from the strongest + weakest signals
  const summaryParts: string[] = [];
  const sortedStrong = snapshot.components
    .filter((c) => c.status === "strong")
    .slice(0, 1);
  const gaps = snapshot.components.filter(
    (c) => c.status === "missing" || c.status === "weak"
  );
  if (sortedStrong.length > 0) {
    summaryParts.push(`Strong ${sortedStrong[0].label.toLowerCase()}`);
  }
  for (const gap of gaps.slice(0, 3)) {
    if (gap.status === "missing") {
      summaryParts.push(`${gap.label} missing`);
    } else {
      summaryParts.push(`${gap.label.toLowerCase()} gap`);
    }
  }
  const summarySentence = summaryParts.join(" · ");

  // Top 3 schools for pipeline display
  const pipelineSchools = schools.slice(0, 5);

  // Alerts
  const alerts: { text: string; href: string }[] = [];
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
          value={icuMonths > 0 ? `${icuMonths} mo` : "—"}
          level={icuMonthsLevel(icuMonths)}
          benchmark={BENCHMARK_TARGETS.icu}
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
                    <SchoolAvatar name={s.name} size={40} />
                    <div className={styles.pipelineInfo}>
                      <div className={styles.pipelineName}>{s.name}</div>
                      {s.location && (
                        <div className={styles.pipelineLoc}>{s.location}</div>
                      )}
                    </div>
                    <div className={styles.pipelineRight}>
                      <StatusPill label={s.status} tone={tone} />
                      {daysLeft !== null && daysLeft >= 0 && daysLeft <= 90 && (
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
                          Due in {daysLeft}d
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
                const tone = componentTone(c.status);
                const statusText =
                  c.status === "strong"
                    ? "Strong"
                    : c.status === "ok"
                    ? "On track"
                    : c.status === "weak"
                    ? "Add detail"
                    : "Missing";
                return (
                  <div key={c.label} className={styles.categoryRow}>
                    <span className={styles.categoryLabel}>{c.label}</span>
                    <span className={styles.categoryPercent}>{c.score}%</span>
                    <span
                      className={styles.categoryStatus}
                      style={{ color: STATUS_TEXT_COLORS[tone] }}
                    >
                      {statusText}
                    </span>
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
