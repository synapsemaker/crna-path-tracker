import { createClient } from "@/lib/supabase/server";
import EssaysClient from "./EssaysClient";

export default async function EssaysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("essays").select("*").order("created_at", { ascending: false });
  return <EssaysClient items={data ?? []} userId={user!.id} />;
}
