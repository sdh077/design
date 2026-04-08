import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewCourseButton } from "./NewCourseButton";

type Course = {
  id: string;
  name: string;
  days_count: number;
  created_at: string;
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("courses")
    .select("id, name, days_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const courses = (data ?? []) as Course[];

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <div className="bg-white px-5 pb-6 pt-10">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#191F28]">내 코스</h1>
            <p className="mt-1 text-sm text-[#6B7684]">여행 코스를 만들고 공유해보세요.</p>
          </div>
          <NewCourseButton />
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-16 pt-4 space-y-3">
        {courses.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center">
            <p className="text-sm text-[#B0B8C1]">아직 코스가 없습니다.</p>
          </div>
        ) : (
          courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}/edit`}
              className="flex items-center justify-between rounded-2xl bg-white p-5 transition hover:bg-[#F8F9FA]"
            >
              <div>
                <p className="font-semibold text-[#191F28]">{course.name}</p>
                <p className="mt-0.5 text-xs text-[#6B7684]">{course.days_count}일 코스</p>
              </div>
              <span className="text-[#B0B8C1]">→</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
