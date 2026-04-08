import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import SchoolForm from "@/components/schools/SchoolForm";
import type { School } from "@/lib/types";

type Props = {
  searchParams: Promise<{ prefill?: string }>;
};

export default async function NewSchoolPage({ searchParams }: Props) {
  const { prefill } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Decode the optional ?prefill=<base64url-json> payload sent by the
  // Meridian Finder. Invalid or malformed payloads are silently ignored —
  // the form just renders empty.
  let prefilledData: Partial<School> | undefined;
  if (prefill) {
    try {
      const decoded = Buffer.from(prefill, "base64url").toString("utf-8");
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        prefilledData = parsed as Partial<School>;
      }
    } catch {
      // ignore — render an empty form
    }
  }

  return (
    <div>
      <PageHeader title="Add School" />
      <SchoolForm userId={user!.id} prefilledData={prefilledData} />
    </div>
  );
}
