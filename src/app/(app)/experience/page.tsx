import { createClient } from "@/lib/supabase/server";
import ExperienceClient from "./ExperienceClient";

export default async function ExperiencePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: units } = await supabase
    .from("hospital_units")
    .select("*")
    .order("current", { ascending: false })
    .order("start_date", { ascending: false });

  return <ExperienceClient units={units ?? []} userId={user!.id} />;
}
