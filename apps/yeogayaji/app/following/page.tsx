import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Profile = {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
};

export default async function FollowingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .order("created_at", { ascending: false });

  const followingIds = (follows ?? []).map((f) => f.following_id as string);

  let profiles: Profile[] = [];
  if (followingIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, handle, display_name, bio")
      .in("id", followingIds);
    profiles = (data ?? []) as Profile[];
    profiles.sort(
      (a, b) => followingIds.indexOf(a.id) - followingIds.indexOf(b.id)
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <div className="bg-white px-5 pb-6 pt-10">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold tracking-tight text-[#191F28]">팔로잉</h1>
          <p className="mt-1 text-sm text-[#6B7684]">내가 팔로우한 계정이에요.</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-16 pt-4 space-y-3">
        {profiles.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center">
            <p className="text-sm text-[#B0B8C1]">팔로우한 계정이 없습니다.</p>
          </div>
        ) : (
          profiles.map((p) => (
            <Link
              key={p.id}
              href={`/u/${p.handle}`}
              className="flex items-center justify-between rounded-2xl bg-white p-5 transition hover:bg-[#F8F9FA]"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[#191F28]">
                  {p.display_name || p.handle}
                </p>
                <p className="mt-0.5 text-xs text-[#6B7684]">@{p.handle}</p>
                {p.bio && (
                  <p className="mt-1 truncate text-sm text-[#6B7684]">{p.bio}</p>
                )}
              </div>
              <span className="ml-4 shrink-0 text-[#B0B8C1]">→</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
