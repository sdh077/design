"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

export type CourseItem = {
  id: string;
  day: number;
  sort_order: number;
  name: string;
  link: string | null;
  description: string | null;
  time: string | null;
};

type Props = {
  courseId: string;
  courseName: string;
  daysCount: number;
  initialItems: CourseItem[];
};

export default function TimelineEditor({ courseId, courseName, daysCount, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<CourseItem[]>(initialItems);
  const [activeDay, setActiveDay] = useState(1);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", link: "", description: "", time: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const dayItems = items.filter((i) => i.day === activeDay);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dayItems.findIndex((i) => i.id === active.id);
    const newIndex = dayItems.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(dayItems, oldIndex, newIndex);

    // sort_order 업데이트
    const updatedAll = items.map((item) => {
      if (item.day !== activeDay) return item;
      const idx = reordered.findIndex((r) => r.id === item.id);
      return { ...item, sort_order: idx };
    });
    setItems(updatedAll);

    // 서버 반영
    await Promise.all(
      reordered.map((item, idx) =>
        fetch(`/api/course-items/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: idx }),
        })
      )
    );
  };

  const onAdd = async () => {
    if (!newItem.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: activeDay,
          name: newItem.name.trim(),
          link: newItem.link.trim() || null,
          description: newItem.description.trim() || null,
          time: newItem.time.trim() || null,
          sort_order: dayItems.length,
        }),
      });
      const data = await res.json() as { item?: CourseItem };
      if (res.ok && data.item) {
        setItems((prev) => [...prev, data.item!]);
        setNewItem({ name: "", link: "", description: "", time: "" });
        setAdding(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (itemId: string) => {
    if (!confirm("삭제할까요?")) return;
    await fetch(`/api/course-items/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const onSaveEdit = async (item: CourseItem, updated: Partial<CourseItem>) => {
    await fetch(`/api/course-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <div className="bg-white px-5 pb-6 pt-10">
        <div className="mx-auto max-w-lg">
          <button onClick={() => router.push("/courses")} className="mb-2 text-xs text-[#6B7684] hover:underline">
            ← 내 코스
          </button>
          <h1 className="text-2xl font-bold text-[#191F28]">{courseName}</h1>
          <p className="mt-1 text-sm text-[#6B7684]">{daysCount}일 코스 수정</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-16 pt-4">
        {/* Day 탭 */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: daysCount }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => { setActiveDay(day); setAdding(false); }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeDay === day ? "bg-[#191F28] text-white" : "bg-white text-[#6B7684] hover:bg-[#E5E8EB]"
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>

        {/* 타임라인 */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={dayItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {dayItems.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onEdit={() => setEditingId(item.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={(updated) => onSaveEdit(item, updated)}
                  onDelete={() => onDelete(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* 추가 폼 */}
        {adding ? (
          <div className="mt-3 rounded-2xl bg-white p-5 space-y-3">
            <p className="text-sm font-semibold text-[#191F28]">새 일정 추가</p>
            <input
              autoFocus
              value={newItem.time}
              onChange={(e) => setNewItem((p) => ({ ...p, time: e.target.value }))}
              placeholder="시간 (예: 10:00)"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <input
              value={newItem.name}
              onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
              placeholder="이름 *"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <input
              value={newItem.link}
              onChange={(e) => setNewItem((p) => ({ ...p, link: e.target.value }))}
              placeholder="링크 (선택)"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
              placeholder="설명 (선택)"
              rows={2}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <div className="flex gap-2">
              <button
                onClick={onAdd}
                disabled={saving || !newItem.name.trim()}
                className="rounded-xl bg-[#191F28] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "추가 중…" : "추가"}
              </button>
              <button
                onClick={() => { setAdding(false); setNewItem({ name: "", link: "", description: "", time: "" }); }}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-500"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 w-full rounded-2xl border-2 border-dashed border-[#E5E8EB] py-4 text-sm font-medium text-[#B0B8C1] transition hover:border-[#191F28] hover:text-[#191F28]"
          >
            + 일정 추가
          </button>
        )}
      </div>
    </div>
  );
}

function SortableItem({
  item, isEditing, onEdit, onCancelEdit, onSaveEdit, onDelete,
}: {
  item: CourseItem;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (updated: Partial<CourseItem>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const [draft, setDraft] = useState({ name: item.name, link: item.link ?? "", description: item.description ?? "", time: item.time ?? "" });

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3">
      {/* 드래그 핸들 + 타임라인 점 */}
      <div className="flex flex-col items-center gap-1 pt-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-[#B0B8C1] select-none text-lg leading-none"
          title="드래그해서 순서 변경"
        >
          ⠿
        </div>
        <div className="h-2 w-2 rounded-full bg-[#191F28]" />
      </div>

      <div className="flex-1 rounded-2xl bg-white p-4">
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={draft.time}
              onChange={(e) => setDraft((p) => ({ ...p, time: e.target.value }))}
              placeholder="시간"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <input
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="이름 *"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <input
              value={draft.link}
              onChange={(e) => setDraft((p) => ({ ...p, link: e.target.value }))}
              placeholder="링크"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              placeholder="설명"
              rows={2}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-[#191F28] outline-none placeholder:text-[#B0B8C1]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveEdit({ name: draft.name, link: draft.link || null, description: draft.description || null, time: draft.time || null })}
                disabled={!draft.name.trim()}
                className="rounded-xl bg-[#191F28] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                저장
              </button>
              <button onClick={onCancelEdit} className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500">
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {item.time && <p className="mb-0.5 text-xs font-medium text-[#6B7684]">{item.time}</p>}
              <p className="font-semibold text-[#191F28]">{item.name}</p>
              {item.description && (
                <p className="mt-1 text-sm leading-relaxed text-[#6B7684] whitespace-pre-line">{item.description}</p>
              )}
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-500 underline">
                  링크
                </a>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={onEdit} className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-100">수정</button>
              <button onClick={onDelete} className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50">삭제</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
