import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import SchoolForm from "@/components/schools/SchoolForm";

export default async function NewSchoolPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <PageHeader title="Add School" />
      <SchoolForm userId={user!.id} />
    </div>
  );
}
