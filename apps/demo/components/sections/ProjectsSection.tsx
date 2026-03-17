"use client";

import { useState } from "react";
import ProjectDetailModal from "@/components/modals/ProjectDetailModal";

const projects = [
  {
    id: 1,
    title: "디지털 헬스케어 임상지원 플랫폼",
    period: "2023.01 - 2024.03",
    description:
      "디지털 치료제 임상시험 지원 및 관리자 기능을 제공하는 웹 플랫폼을 개발했습니다.",
    role: [
      "React / Next.js 기반 사용자 화면 개발",
      "Nest.js / MySQL 기반 관리자 기능 연동",
      "요구사항 분석 후 기능 설계 및 개선",
    ],
    highlights: [
      "임상시험 운영 흐름에 맞춘 화면 및 기능 구현",
      "내부 사용자 피드백을 반영해 관리 편의성 개선",
    ],
    techStack: ["React", "Next.js", "Nest.js", "MySQL", "TypeScript"],
    link: "https://example.com",
    github: "https://github.com/example/repo",
  },
  {
    id: 2,
    title: "쇼핑몰 통합 연동 솔루션",
    period: "2021.03 - 2022.12",
    description:
      "여러 쇼핑몰 오픈 API를 연동하여 주문, 상품, 배송 데이터를 처리하는 시스템 운영 및 개발을 담당했습니다.",
    role: [
      "외부 쇼핑몰 API 연동 유지보수",
      "장애 원인 분석 및 빠른 대응",
      "운영 효율화를 위한 기능 개선",
    ],
    highlights: [
      "다양한 쇼핑몰 정책 차이를 반영한 안정적 운영",
      "로그 분석 기반 문제 해결 역량 강화",
    ],
    techStack: ["JavaScript", "Node.js", "Express", "REST API"],
  },
];

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<
    (typeof projects)[number] | null
  >(null);

  return (
    <>
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-white">Projects</h2>
            <p className="mt-3 text-neutral-400">
              문제를 이해하고, 구조를 정리하고, 실제로 동작하게 만든 프로젝트들입니다.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <h3 className="text-xl font-semibold text-white">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  {project.period}
                </p>
                <p className="mt-4 line-clamp-3 leading-7 text-neutral-300">
                  {project.description}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-200 transition hover:bg-white/10"
                >
                  상세보기
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ProjectDetailModal
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title ?? ""}
        period={selectedProject?.period}
        description={selectedProject?.description}
        role={selectedProject?.role ?? []}
        highlights={selectedProject?.highlights ?? []}
        techStack={selectedProject?.techStack ?? []}
        link={selectedProject?.link}
        github={selectedProject?.github}
      />
    </>
  );
}