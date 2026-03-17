"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Chip from "@/components/ui/Chip";
import { experienceStack, mainStack } from "@/data/portfolio";
import { fadeUp } from "@/lib/motion";

export default function TechStackSection() {
  return (
    <section className="py-20 md:py-28">
      <motion.div {...fadeUp}>
        <SectionHeading
          eyebrow="Tech Stack"
          title="주로 사용하는 기술과 경험한 기술"
          description="실제로 자주 사용하는 기술과 프로젝트를 통해 경험한 기술을 구분해 정리했습니다."
        />
      </motion.div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <motion.div
          {...fadeUp}
          className="rounded-3xl border border-white/5 bg-white/[0.03] p-7"
        >
          <h3 className="text-xl font-semibold text-white">Main</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {mainStack.map((tech) => (
              <Chip key={tech}>{tech}</Chip>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="rounded-3xl border border-white/5 bg-white/[0.03] p-7"
        >
          <h3 className="text-xl font-semibold text-white">Experience</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {experienceStack.map((tech) => (
              <Chip key={tech}>{tech}</Chip>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}