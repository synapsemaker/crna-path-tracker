import { createClient } from "@/lib/supabase/server";
import { calculateReadiness } from "@/lib/readiness";
import { getQuickActions } from "@/lib/quickActions";
import {
  gpaLevel,
  scienceGpaLevel,
  shadowingLevel,
  icuMonthsLevel,
  greVerbalLevel,
  greQuantLevel,
  BENCHMARK_TARGETS,
} from "@/lib/benchmarks";
import { calculateGPA, calculateScienceGPA } from "@/lib/gpa";
import Link from "next/link";
import BenchmarkStat from "@/components/ui/BenchmarkStat";
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

  // Upcoming deadlines (next 60 days)
  const upcomingDeadlines = schools
    .filter(
      (s) =>
        s.application_deadline &&
        s.application_deadline >= todayStr &&
        s.application_deadline <= sixtyDaysOut
    )
    .sort((a, b) =>
      (a.application_deadline ?? "").localeCompare(b.application_deadline ?? "")
    )
    .slice(0, 5);

  // Alerts
  const alerts: { text: string; href: string }[] = [];
  const overdueLetters = letters.filter(
    (l) =>
      l.status !== "Received" && l.due_date && l.due_date < todayStr
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

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  for (const s of schools) {
    pipelineCounts[s.status] = (pipelineCounts[s.status] ?? 0) + 1;
  }

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
      <h1 className={styles.title}>Dashboard</h1>

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

      {/* Readiness + Quick actions */}
      <div className={styles.readinessRow}>
        <div className={styles.readinessCard}>
          <div className={styles.readinessLabel}>Application readiness</div>
          <div className={styles.readinessScore}>{snapshot.score}</div>
          <div className={styles.readinessSub}>
            {snapshot.score >= 80
              ? "Strong — you're ready to apply"
              : snapshot.score >= 60
              ? "On track — keep building"
              : snapshot.score >= 40
              ? "Coming together — focus on gaps"
              : "Getting started — add the basics"}
          </div>
          <div className={styles.readinessBar}>
            <div
              className={styles.readinessBarFill}
              style={{ width: `${snapshot.score}%` }}
            />
          </div>
          {snapshot.primaryGap && (
            <div className={styles.readinessGap}>
              Biggest gap: <strong>{snapshot.primaryGap}</strong>
            </div>
          )}
        </div>

        <div className={styles.quickActions}>
          <div className={styles.sectionLabel}>Next steps</div>
          {quickActions.map((a, i) => (
            <Link key={i} href={a.href} className={styles.actionCard}>
              <div className={styles.actionLabel}>{a.label}</div>
              <div className={styles.actionDesc}>{a.description}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Benchmark stats */}
      <div className={styles.statsLabel}>Profile</div>
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
        {academic?.gre_verbal && (
          <BenchmarkStat
            label="GRE Verbal"
            value={academic.gre_verbal}
            level={greVerbalLevel(academic.gre_verbal)}
            benchmark={BENCHMARK_TARGETS.greVerbal}
          />
        )}
        {academic?.gre_quantitative && (
          <BenchmarkStat
            label="GRE Quant"
            value={academic.gre_quantitative}
            level={greQuantLevel(academic.gre_quantitative)}
            benchmark={BENCHMARK_TARGETS.greQuant}
          />
        )}
      </div>

      {/* Two columns: Deadlines + Pipeline */}
      <div className={styles.grid}>
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>
              Upcoming deadlines (60 days)
            </span>
            <Link href="/schools" className={styles.viewAll}>
              All schools →
            </Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className={styles.empty}>
              {schools.length === 0
                ? "Add a school to track deadlines"
                : "No deadlines in the next 60 days"}
            </p>
          ) : (
            <div className={styles.deadlineList}>
              {upcomingDeadlines.map((s) => {
                const daysLeft = Math.round(
                  (new Date(s.application_deadline + "T00:00:00").getTime() -
                    today.getTime()) /
                    86400000
                );
                return (
                  <Link
                    key={s.id}
                    href={`/schools/${s.id}`}
                    className={styles.deadlineRow}
                  >
                    <div>
                      <div className={styles.deadlineName}>{s.name}</div>
                      <div className={styles.deadlineMeta}>{s.status}</div>
                    </div>
                    <div className={styles.deadlineDays}>
                      <span
                        className={
                          daysLeft <= 14
                            ? styles.deadlineUrgent
                            : daysLeft <= 30
                            ? styles.deadlineWarn
                            : ""
                        }
                      >
                        {daysLeft}d
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Pipeline</span>
          </div>
          {schools.length === 0 ? (
            <p className={styles.empty}>No schools added yet</p>
          ) : (
            <div className={styles.pipelineList}>
              {[
                "Researching",
                "Planning to Apply",
                "Applied",
                "Interviewed",
                "Accepted",
                "Waitlisted",
                "Declined",
              ]
                .filter((status) => pipelineCounts[status])
                .map((status) => (
                  <div key={status} className={styles.pipelineRow}>
                    <span className={styles.pipelineStatus}>{status}</span>
                    <span className={styles.pipelineCount}>
                      {pipelineCounts[status]}
                    </span>
                  </div>
                ))}
            </div>
          )}
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
