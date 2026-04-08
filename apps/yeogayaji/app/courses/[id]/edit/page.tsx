import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TimelineEditor, { type CourseItem } from "./TimelineEditor";

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, days_count, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!course || course.user_id !== user.id) notFound();

  const { data: items } = await supabase
    .from("course_items")
    .select("id, day, sort_order, name, link, description, time, lat, lng, kakao_map_link")
    .eq("course_id", id)
    .order("day", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <TimelineEditor
      courseId={id}
      courseName={course.name}
      daysCount={course.days_count}
      initialItems={(items ?? []) as CourseItem[]}
    />
  );
}
