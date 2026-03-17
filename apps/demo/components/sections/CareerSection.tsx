"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { timeline } from "@/data/portfolio";
import { fadeUp } from "@/lib/motion";

export default function CareerSection() {
  return (
    <section id="career" className="py-20 md:py-28">
      <motion.div {...fadeUp}>
        <SectionHeading
          eyebrow="Career Timeline"
          title="실무 경험과 경력 흐름"
          description="화려한 키워드보다 실제로 맡았던 일과 도메인 경험이 드러나도록 정리했습니다."
        />
      </motion.div>

      <div className="mt-12 space-y-5">
        {timeline.map((item, index) => (
          <motion.div
            key={`${item.year}-${item.company}`}
            {...fadeUp}
            transition={{ duration: 0.55, delay: index * 0.05 }}
            className="grid gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-6 md:grid-cols-[180px_1fr] md:gap-8 md:p-8"
          >
            <div className="text-sm font-medium text-zinc-400">{item.year}</div>
            <div>
              <h3 className="text-xl font-semibold text-white">{item.company}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}