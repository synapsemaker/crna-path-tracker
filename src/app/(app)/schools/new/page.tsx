import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import SchoolForm from "@/components/schools/SchoolForm";
import {
  getCatalogProgramBySlug,
  catalogProgramToSchoolPrefill,
} from "@/lib/catalog";
import type { School } from "@/lib/types";

type Props = {
  searchParams: Promise<{ program?: string }>;
};

export default async function NewSchoolPage({ searchParams }: Props) {
  const { program: programSlug } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If a program slug was passed (from Meridian's "+ Tracker" button),
  // fetch the canonical program from the End Tidal catalog and use it
  // to prefill the form. Unknown / removed slugs render an empty form.
  let prefilledData: Partial<School> | undefined;
  if (programSlug) {
    const catalogProgram = await getCatalogProgramBySlug(programSlug);
    if (catalogProgram) {
      prefilledData = catalogProgramToSchoolPrefill(catalogProgram);
    }
  }

  return (
    <div>
      <PageHeader title="Add School" />
      <SchoolForm userId={user!.id} prefilledData={prefilledData} />
    </div>
  );
}
