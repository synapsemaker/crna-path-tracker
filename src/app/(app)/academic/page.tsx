import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import GREForm from "@/components/academic/GREForm";
import CourseTable from "@/components/academic/CourseTable";

export default async function AcademicPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: courses }] = await Promise.all([
    supabase.from("academic_profile").select("*").maybeSingle(),
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader title="Academic Profile" />
      <GREForm profile={profile} userId={user!.id} />
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 32, paddingTop: 32 }}>
        <CourseTable courses={courses ?? []} userId={user!.id} />
      </div>
    </div>
  );
}
