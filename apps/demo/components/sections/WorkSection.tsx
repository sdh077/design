"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { workPrinciples } from "@/data/portfolio";
import { fadeUp } from "@/lib/motion";

export default function WorkSection() {
  return (
    <section id="work" className="py-20 md:py-28">
      <motion.div {...fadeUp}>
        <SectionHeading
          eyebrow="How I Work"
          title="기능 구현보다 문제 해결에 집중합니다"
          description="서비스를 실제로 운영하는 과정에서 필요한 안정성, 소통, 유지보수 관점을 중요하게 생각합니다."
        />
      </motion.div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {workPrinciples.map((item, index) => (
          <motion.div
            key={item.title}
            {...fadeUp}
            transition={{ duration: 0.55, delay: index * 0.05 }}
            className="rounded-3xl border border-white/5 bg-white/[0.03] p-7"
          >
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}