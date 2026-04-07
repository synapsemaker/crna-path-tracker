import { createClient } from "@/lib/supabase/server";
import PublicationsClient from "./PublicationsClient";

export default async function PublicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("publications").select("*").order("created_at", { ascending: false });
  return <PublicationsClient items={data ?? []} userId={user!.id} />;
}
