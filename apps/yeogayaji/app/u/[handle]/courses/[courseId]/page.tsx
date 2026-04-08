import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type CourseItem = {
  id: string;
  day: number;
  sort_order: number;
  name: string;
  link: string | null;
  description: string | null;
  time: string | null;
};

type Course = {
  id: string;
  name: string;
  days_count: number;
  user_id: string;
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ handle: string; courseId: string }>;
}) {
  const { handle, courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, days_count, user_id")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) notFound();

  const { data: items } = await supabase
    .from("course_items")
    .select("id, day, sort_order, name, link, description, time")
    .eq("course_id", courseId)
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  const c = course as Course;
  const allItems = (items ?? []) as CourseItem[];
  const isOwner = user?.id === c.user_id;

  // day별 그룹핑
  const days = Array.from({ length: c.days_count }, (_, i) => i + 1);
  const itemsByDay = (day: number) => allItems.filter((item) => item.day === day);

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <div className="bg-white px-5 pb-6 pt-10">
        <div className="mx-auto max-w-lg">
          <Link href={`/u/${handle}`} className="mb-3 inline-block text-xs text-[#6B7684] hover:underline">
            ← @{handle}
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#191F28]">{c.name}</h1>
              <p className="mt-1 text-sm text-[#6B7684]">{c.days_count}일 코스</p>
            </div>
            {isOwner && (
              <Link
                href={`/courses/${courseId}/edit`}
                className="rounded-full bg-[#191F28] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D3540]"
              >
                수정
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-16 pt-4 space-y-6">
        {days.map((day) => {
          const dayItems = itemsByDay(day);
          return (
            <div key={day}>
              <p className="mb-3 text-sm font-bold text-[#191F28]">Day {day}</p>
              {dayItems.length === 0 ? (
                <div className="rounded-2xl bg-white px-5 py-6 text-center text-sm text-[#B0B8C1]">
                  일정이 없습니다.
                </div>
              ) : (
                <div className="relative">
                  {/* 타임라인 선 */}
                  <div className="absolute left-5 top-5 bottom-5 w-px bg-[#E5E8EB]" />
                  <div className="space-y-3">
                    {dayItems.map((item, idx) => (
                      <div key={item.id} className="flex gap-4">
                        {/* 타임라인 점 */}
                        <div className="relative z-10 mt-5 flex h-3 w-3 shrink-0 items-center justify-center ml-3.5">
                          <div className="h-3 w-3 rounded-full bg-[#191F28]" />
                        </div>
                        <div className="flex-1 rounded-2xl bg-white p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {item.time && (
                                <p className="mb-1 text-xs font-medium text-[#6B7684]">{item.time}</p>
                              )}
                              <p className="font-semibold text-[#191F28]">{item.name}</p>
                              {item.description && (
                                <p className="mt-1 text-sm leading-relaxed text-[#6B7684] whitespace-pre-line">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="shrink-0 rounded-full bg-[#F2F4F6] px-3 py-1.5 text-xs font-semibold text-[#4E5968] hover:bg-[#E5E8EB]"
                              >
                                지도
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
