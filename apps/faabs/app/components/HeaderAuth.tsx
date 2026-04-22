import { createClient } from "../../lib/supabase/server";

export default async function HeaderAuth() {
  const supabase = await createClient("public");
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return (
      <a
        href="/mypage"
        className="text-sm tracking-widest uppercase text-black/70 hover:text-black transition-colors"
      >
        MY
      </a>
    );
  }

  return (
    <a
      href="/auth/signin"
      className="text-sm tracking-widest uppercase text-black/70 hover:text-black transition-colors"
    >
      LOGIN
    </a>
  );
}
