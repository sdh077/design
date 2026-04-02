import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    await supabase.auth.signOut();
  } catch {
    // 로그아웃 실패여도 로그인 페이지로 이동
  }

  redirect("/login");
}
