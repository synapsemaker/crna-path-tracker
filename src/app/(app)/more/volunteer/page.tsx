import { createClient } from "@/lib/supabase/server";
import VolunteerClient from "./VolunteerClient";

export default async function VolunteerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("volunteer_work").select("*").order("created_at", { ascending: false });
  return <VolunteerClient items={data ?? []} userId={user!.id} />;
}
