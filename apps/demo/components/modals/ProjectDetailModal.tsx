"use client";

import { useEffect } from "react";
import { motion, useDragControls } from "framer-motion";

type ProjectDetailModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  period?: string;
  description?: string;
  role?: string[];
  techStack?: string[];
  highlights?: string[];
  link?: string;
  github?: string;
};

export default function ProjectDetailModal({
  open,
  onClose,
  title,
  period,
  description,
  role = [],
  techStack = [],
  highlights = [],
  link,
  github,
}: ProjectDetailModalProps) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* center area */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0.08}
          whileTap={{ cursor: "grabbing" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/95 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
        >
          {/* header - drag handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex cursor-grab select-none items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4 active:cursor-grabbing"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
              </div>
              <div className="text-sm font-medium text-neutral-300">
                프로젝트 상세보기
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white"
            >
              닫기
            </button>
          </div>

          {/* content */}
          <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Project
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  {title}
                </h2>
                {period && (
                  <p className="mt-2 text-sm text-neutral-400">{period}</p>
                )}
              </div>

              {description && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-200">
                    소개
                  </h3>
                  <p className="leading-7 text-neutral-300">{description}</p>
                </section>
              )}

              {role.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-200">
                    담당 업무
                  </h3>
                  <ul className="space-y-2">
                    {role.map((item, idx) => (
                      <li
                        key={`${item}-${idx}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-neutral-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {highlights.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-200">
                    주요 성과
                  </h3>
                  <ul className="space-y-2">
                    {highlights.map((item, idx) => (
                      <li
                        key={`${item}-${idx}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-neutral-300"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {techStack.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-200">
                    기술 스택
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, idx) => (
                      <span
                        key={`${tech}-${idx}`}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-neutral-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {(link || github) && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-200">
                    링크
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-200 transition hover:bg-white/10"
                      >
                        서비스 보기
                      </a>
                    )}

                    {github && (
                      <a
                        href={github}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-200 transition hover:bg-white/10"
                      >
                        GitHub 보기
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}