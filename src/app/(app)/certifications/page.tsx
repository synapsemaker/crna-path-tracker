import { createClient } from "@/lib/supabase/server";
import CertificationsClient from "./CertificationsClient";

export default async function CertificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: certs } = await supabase
    .from("certifications")
    .select("*")
    .order("created_at", { ascending: false });

  return <CertificationsClient certs={certs ?? []} userId={user!.id} />;
}
