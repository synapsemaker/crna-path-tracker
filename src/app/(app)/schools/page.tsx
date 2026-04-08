import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { SCHOOL_STATUSES } from "@/lib/constants";
import type { School } from "@/lib/types";
import styles from "./page.module.css";

export default async function SchoolsPage() {
  const supabase = await createClient();
  const { data: schools } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });

  const allSchools: School[] = schools ?? [];

  // Group schools by status
  const grouped: Record<string, School[]> = {};
  for (const status of SCHOOL_STATUSES) {
    grouped[status] = [];
  }
  for (const s of allSchools) {
    if (grouped[s.status]) grouped[s.status].push(s);
  }

  // Only show columns that have schools, or show first 4 always
  const ACTIVE_STATUSES: string[] = [
    "Researching",
    "Planning to Apply",
    "Applied",
    "Interviewed",
    "Accepted",
    "Waitlisted",
    "Declined",
  ];

  return (
    <div>
      <PageHeader
        title="Schools"
        action={
          <Link href="/schools/new" className={styles.addBtn}>
            + Add school
          </Link>
        }
      />

      {allSchools.length === 0 ? (
        <EmptyState
          title="Build your target school list."
          body="Most CRNA applicants apply to 3–6 programs. Track each one through the full pipeline — research, application, interview, decision — so nothing falls through the cracks."
          action={
            <Link href="/schools/new" className={styles.addBtn}>
              + Add your first school
            </Link>
          }
        />
      ) : (
        <div className={styles.kanban}>
          {ACTIVE_STATUSES.map((status) => {
            const schoolsInStatus = grouped[status] ?? [];
            if (schoolsInStatus.length === 0) return null;
            return (
              <div key={status} className={styles.column}>
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{status}</span>
                  <span className={styles.columnCount}>
                    {schoolsInStatus.length}
                  </span>
                </div>
                <div className={styles.columnBody}>
                  {schoolsInStatus.map((s) => (
                    <Link
                      key={s.id}
                      href={`/schools/${s.id}`}
                      className={styles.card}
                    >
                      <div className={styles.cardName}>{s.program_name}</div>
                      {s.location && (
                        <div className={styles.cardLocation}>{s.location}</div>
                      )}
                      {s.application_deadline && (
                        <div className={styles.cardDeadline}>
                          {new Date(
                            s.application_deadline + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
