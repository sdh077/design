"use client";

import { motion } from "framer-motion";
import { Github, Mail } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { fadeUp } from "@/lib/motion";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-28">
      <motion.div
        {...fadeUp}
        className="rounded-[32px] border border-white/5 bg-white/[0.03] px-6 py-10 md:px-10 md:py-12"
      >
        <SectionHeading
          eyebrow="Contact"
          title="함께 협업하기 좋은 개발자를 찾고 있다면"
          description="협업과 문제 해결을 함께할 수 있는 개발자를 찾고 있다면 편하게 연락 주세요. 이력서와 상세 경력은 요청하시면 공유드립니다."
        />

        <div className="mt-8 flex flex-col gap-4 text-zinc-300 md:flex-row md:flex-wrap md:items-center md:gap-6">
          <a
            href="mailto:sdh077@gmail.com"
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <Mail className="h-4 w-4" />
            sdh077@gmail.com
          </a>

          <a
            href="https://github.com/sdh077"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <Github className="h-4 w-4" />
            github.com/sdh077
          </a>
        </div>
      </motion.div>
    </section>
  );
}