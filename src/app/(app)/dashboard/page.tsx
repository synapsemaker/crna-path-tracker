import { createClient } from "@/lib/supabase/server";
import { calculateGPA, calculateScienceGPA } from "@/lib/gpa";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date().toISOString().split("T")[0];

  const [
    { data: courses },
    { data: deadlines },
    { data: shadowing },
    { data: ccrn },
    { data: schools },
    { data: profile },
  ] = await Promise.all([
    supabase.from("courses").select("credits, grade_points, is_science"),
    supabase
      .from("schools")
      .select("name, application_deadline, status")
      .gte("application_deadline", now)
      .order("application_deadline", { ascending: true })
      .limit(5),
    supabase.from("shadowing_hours").select("hours"),
    supabase
      .from("certifications")
      .select("status")
      .eq("name", "CCRN")
      .limit(1)
      .maybeSingle(),
    supabase.from("schools").select("status"),
    supabase.from("academic_profile").select("gre_verbal, gre_quantitative, gre_writing").maybeSingle(),
  ]);

  const overallGPA = calculateGPA(courses ?? []);
  const scienceGPA = calculateScienceGPA(courses ?? []);
  const totalHours = (shadowing ?? []).reduce(
    (sum, s) => sum + (s.hours ?? 0),
    0
  );
  const ccrnStatus = ccrn?.status ?? "Not started";

  // Count schools by status
  const statusCounts: Record<string, number> = {};
  for (const s of schools ?? []) {
    statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>

      {/* Progress metrics */}
      <div className={styles.stats}>
        <StatCard label="Overall GPA" value={overallGPA?.toFixed(2) ?? "—"} />
        <StatCard label="Science GPA" value={scienceGPA?.toFixed(2) ?? "—"} />
        <StatCard label="Shadowing hours" value={totalHours} />
        <StatCard label="CCRN" value={ccrnStatus} />
      </div>

      {/* Two-column layout */}
      <div className={styles.grid}>
        {/* Left: Upcoming deadlines */}
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Upcoming deadlines</span>
          </div>
          {(deadlines ?? []).length === 0 ? (
            <p className={styles.empty}>No upcoming deadlines</p>
          ) : (
            <div className={styles.deadlineList}>
              {(deadlines ?? []).map((d, i) => (
                <div key={i} className={styles.deadlineRow}>
                  <div>
                    <div className={styles.deadlineName}>{d.name}</div>
                    <StatusBadge status={d.status} />
                  </div>
                  <span className={styles.deadlineDate}>
                    {new Date(d.application_deadline + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Schools summary + GRE + Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Schools summary */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Schools</span>
              <Link href="/schools" className={styles.viewAll}>
                View all →
              </Link>
            </div>
            {Object.keys(statusCounts).length === 0 ? (
              <p className={styles.empty}>No schools added yet</p>
            ) : (
              <div className={styles.statusGrid}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className={styles.statusItem}>
                    <span className={styles.statusCount}>{count}</span>
                    <StatusBadge status={status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GRE scores */}
          {profile && (profile.gre_verbal || profile.gre_quantitative || profile.gre_writing) && (
            <div>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>GRE scores</span>
              </div>
              <div className={styles.greRow}>
                {profile.gre_verbal && (
                  <div className={styles.greItem}>
                    <span className={styles.greValue}>{profile.gre_verbal}</span>
                    <span className={styles.greLabel}>Verbal</span>
                  </div>
                )}
                {profile.gre_quantitative && (
                  <div className={styles.greItem}>
                    <span className={styles.greValue}>{profile.gre_quantitative}</span>
                    <span className={styles.greLabel}>Quant</span>
                  </div>
                )}
                {profile.gre_writing && (
                  <div className={styles.greItem}>
                    <span className={styles.greValue}>{profile.gre_writing}</span>
                    <span className={styles.greLabel}>Writing</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Quick actions</span>
            </div>
            <div className={styles.actions}>
              <Link href="/schools/new" className={styles.actionBtn}>
                + Add school
              </Link>
              <Link href="/shadowing" className={styles.actionBtn}>
                + Log shadowing
              </Link>
              <Link href="/academic" className={styles.actionBtn}>
                + Update profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
