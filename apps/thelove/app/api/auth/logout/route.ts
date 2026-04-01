import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function performLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?loggedOut=1");
}

export async function GET() {
  await performLogout();
}

export async function POST() {
  await performLogout();
}
