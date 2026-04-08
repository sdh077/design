"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewCourseButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), days_count: days }),
      });
      const data = await res.json() as { course?: { id: string } };
      if (res.ok && data.course) {
        router.push(`/courses/${data.course.id}/edit`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#191F28] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D3540]"
      >
        + 새 코스
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="코스 이름"
        autoFocus
        className="w-32 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900"
      />
      <select
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}일</option>
        ))}
      </select>
      <button
        onClick={onCreate}
        disabled={loading || !name.trim()}
        className="rounded-xl bg-[#191F28] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "…" : "만들기"}
      </button>
      <button
        onClick={() => { setOpen(false); setName(""); setDays(1); }}
        className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800"
      >
        취소
      </button>
    </div>
  );
}
