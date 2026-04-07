import { createClient } from "@/lib/supabase/server";
import NetworkClient from "./NetworkClient";

export default async function NetworkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("network").select("*").order("created_at", { ascending: false });
  return <NetworkClient items={data ?? []} userId={user!.id} />;
}
