import { createClient } from "@/lib/supabase/server";
import ConferencesClient from "./ConferencesClient";

export default async function ConferencesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("conferences").select("*").order("date", { ascending: false });
  return <ConferencesClient items={data ?? []} userId={user!.id} />;
}
