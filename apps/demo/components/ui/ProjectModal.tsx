"use client";

import { X } from "lucide-react";
import Chip from "@/components/ui/Chip";
import type { FeaturedProject } from "@/data/portfolio";
import { useEffect } from "react";

type ProjectModalProps = {
  project: FeaturedProject | null;
  onClose: () => void;
};

export default function ProjectModal({
  project,
  onClose,
}: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 px-6 py-5 md:px-8">
          <div>
            <p className="text-sm text-zinc-500">{project.company}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
              {project.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">{project.period}</p>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6 md:px-8 md:py-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                Overview
              </p>
              <p className="mt-4 text-base leading-8 text-zinc-300">
                {project.overview}
              </p>

              <div className="mt-8">
                <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                  Details
                </p>
                <ul className="mt-4 space-y-3">
                  {project.details.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-zinc-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                  Tech Stack
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Chip key={tech}>{tech}</Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Focus
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {project.focus}
                </p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Role
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {project.role}
                </p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Outcome
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {project.outcome}
                </p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Key Contributions
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                  {project.contributions.map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-zinc-300">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/5 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Project Note
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {project.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}