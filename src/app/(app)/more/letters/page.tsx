import { createClient } from "@/lib/supabase/server";
import LettersClient from "./LettersClient";

export default async function LettersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("letters_of_rec").select("*").order("created_at", { ascending: false });
  return <LettersClient items={data ?? []} userId={user!.id} />;
}
