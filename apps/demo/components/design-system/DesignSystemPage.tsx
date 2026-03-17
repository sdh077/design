"use client";

import {
  DSSection,
  DSColorChip,
  DSButton,
  DSCard,
  DSBadge,
  DSInput,
  DSSectionTitle,
} from "@/components/design-system/ui";

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="border-b border-white/10 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
            Design System
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Portfolio UI Foundation
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-400 md:text-lg">
            포트폴리오 전반에 사용되는 색상, 타이포그래피, 버튼, 카드,
            입력 요소 등 UI 기준을 정리한 페이지입니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-20">
          <DSSection title="Color">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DSColorChip name="Background" value="bg-neutral-950" previewClass="bg-neutral-950" />
              <DSColorChip name="Surface" value="bg-white/[0.03]" previewClass="bg-white/[0.03]" />
              <DSColorChip name="Border" value="border-white/10" previewClass="bg-white/10" />
              <DSColorChip name="Text Muted" value="text-neutral-400" previewClass="bg-neutral-400" />
            </div>
          </DSSection>

          <DSSection title="Typography">
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h1 className="text-5xl font-semibold tracking-tight">Heading 1</h1>
              <h2 className="text-3xl font-semibold tracking-tight">Heading 2</h2>
              <h3 className="text-xl font-semibold tracking-tight">Heading 3</h3>
              <p className="max-w-2xl text-base leading-7 text-neutral-300">
                본문 텍스트는 가독성을 위해 line-height를 여유 있게 두고,
                설명 문장은 너무 길지 않게 유지합니다.
              </p>
              <p className="text-sm text-neutral-500">
                Caption / Meta Text / Supplementary Copy
              </p>
            </div>
          </DSSection>

          <DSSection title="Buttons">
            <div className="flex flex-wrap gap-4">
              <DSButton>Primary Button</DSButton>
              <DSButton variant="secondary">Secondary Button</DSButton>
              <DSButton variant="ghost">Ghost Button</DSButton>
            </div>
          </DSSection>

          <DSSection title="Badges">
            <div className="flex flex-wrap gap-3">
              <DSBadge>React</DSBadge>
              <DSBadge>Next.js</DSBadge>
              <DSBadge>TypeScript</DSBadge>
              <DSBadge>Node.js</DSBadge>
            </div>
          </DSSection>

          <DSSection title="Inputs">
            <div className="grid gap-4 md:max-w-xl">
              <DSInput placeholder="이름" />
              <DSInput placeholder="이메일" />
              <DSInput placeholder="메시지" />
            </div>
          </DSSection>

          <DSSection title="Cards">
            <div className="grid gap-6 md:grid-cols-2">
              <DSCard
                title="Project Card"
                description="프로젝트 요약, 기간, 주요 역할, 기술 스택 등을 보여주는 기본 카드입니다."
              />
              <DSCard
                title="Content Card"
                description="설명형 콘텐츠나 경험 요약 등 다양한 블록 UI에 공통으로 사용할 수 있습니다."
              />
            </div>
          </DSSection>

          <DSSection title="Section Title">
            <div className="space-y-10">
              <DSSectionTitle
                eyebrow="Portfolio"
                title="Projects"
                description="문제를 이해하고 구조를 정리하며 실제 동작하는 결과물로 연결한 프로젝트들입니다."
              />
              <DSSectionTitle
                eyebrow="Career"
                title="Experience"
                description="유지보수와 신규 개발, 운영과 개선을 모두 경험하며 쌓아온 실무 기반의 경력입니다."
              />
            </div>
          </DSSection>
        </div>
      </div>
    </main>
  );
}