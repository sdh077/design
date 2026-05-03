import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PublicProfile = {
  id: string;
  handle: string;
  display_name: string | null;
};

type Course = {
  id: string;
  name: string;
  days_count: number;
  created_at: string;
};

export default async function CoursesListPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, display_name")
    .eq("handle", handle)
    .eq("is_public", true)
    .maybeSingle<PublicProfile>();

  if (!profile) notFound();

  const { data: rawCourses } = await supabase
    .from("courses")
    .select("id, name, days_count, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const courses = (rawCourses ?? []) as Course[];

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <div className="bg-white px-5 pb-6 pt-10">
        <div className="mx-auto max-w-lg">
          <Link href={`/u/${handle}`} className="mb-3 inline-block text-xs text-[#6B7684] hover:underline">
            ← @{handle}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#191F28]">
            {profile.display_name || profile.handle}의 코스
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-16 pt-4">
        {courses.length === 0 ? (
          <div className="rounded-2xl bg-white px-5 py-10 text-center text-sm text-[#B0B8C1]">
            공개된 코스가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/u/${handle}/courses/${course.id}`}
                className="block rounded-2xl bg-white px-5 py-4 transition hover:shadow-sm"
              >
                <p className="font-semibold text-[#191F28]">{course.name}</p>
                <p className="mt-1 text-sm text-[#6B7684]">{course.days_count}일 코스</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
