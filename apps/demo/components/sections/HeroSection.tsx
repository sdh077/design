"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(".hero-badge", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        )
        .from(
          ".hero-desc",
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-buttons",
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4"
        );
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="min-h-screen flex items-center px-6"
    >
      <div className="max-w-5xl">
        <div className="hero-badge mb-6 text-sm text-neutral-400">
          Fullstack Developer
        </div>

        <h1 className="hero-title text-5xl md:text-6xl font-bold leading-tight">
          함께 일하기 좋은 개발자
        </h1>

        <p className="hero-desc mt-6 text-lg text-neutral-400 max-w-xl">
          사용자와 동료 모두가 이해하기 쉬운 시스템을 만들기 위해
          문제를 정리하고 개선하는 개발을 합니다.
        </p>

        <div className="hero-buttons mt-10 flex gap-4">
          <button className="px-6 py-3 rounded-xl bg-white text-black font-medium">
            프로젝트 보기
          </button>

          <button className="px-6 py-3 rounded-xl border border-neutral-700">
            연락하기
          </button>
        </div>
      </div>
    </section>
  );
}