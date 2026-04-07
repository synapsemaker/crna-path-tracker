import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import styles from "./page.module.css";

export default async function SchoolsPage() {
  const supabase = await createClient();
  const { data: schools } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: false });

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
      {(schools ?? []).length === 0 ? (
        <EmptyState
          message="No schools added yet"
          action={
            <Link href="/schools/new" className={styles.addBtn}>
              + Add your first school
            </Link>
          }
        />
      ) : (
        <div className={styles.list}>
          {(schools ?? []).map((s) => (
            <Link
              key={s.id}
              href={`/schools/${s.id}`}
              className={styles.card}
            >
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.cardName}>{s.name}</div>
                  {s.location && (
                    <div className={styles.cardLocation}>{s.location}</div>
                  )}
                </div>
                <StatusBadge status={s.status} />
              </div>
              {s.application_deadline && (
                <div className={styles.cardMeta}>
                  Deadline:{" "}
                  {new Date(s.application_deadline + "T00:00:00").toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
