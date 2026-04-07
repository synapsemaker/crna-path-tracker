import { createClient } from "@/lib/supabase/server";
import ShadowingClient from "./ShadowingClient";

export default async function ShadowingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: entries } = await supabase
    .from("shadowing_hours")
    .select("*")
    .order("date", { ascending: false });

  const totalHours = (entries ?? []).reduce((sum, e) => sum + (e.hours ?? 0), 0);

  return (
    <ShadowingClient
      entries={entries ?? []}
      userId={user!.id}
      totalHours={totalHours}
    />
  );
}
