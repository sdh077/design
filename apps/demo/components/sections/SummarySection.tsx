"use client";

import { motion } from "framer-motion";
import { summaryItems } from "@/data/portfolio";
import { fadeUp } from "@/lib/motion";

export default function SummarySection() {
  return (
    <motion.section {...fadeUp} className="py-14 md:py-20">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 shadow-2xl shadow-black/10"
          >
            <div className="text-2xl font-semibold text-white">{item.title}</div>
            <div className="mt-3 text-sm leading-6 text-zinc-400">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}