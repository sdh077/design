"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function Philosophy() {
  const { lang } = useLanguage();
  const p = t.philosophy;

  return (
    <section id="philosophy" className="py-32 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-4">
              {p.label[lang]}
            </p>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-none uppercase text-[#0a0a0a]">
              {p.title1[lang]}
              <br />
              <span className="text-black/20">{p.title2[lang]}</span>
              {p.title3[lang] && (
                <>
                  <br />
                  {p.title3[lang]}
                </>
              )}
            </h2>
          </div>
          <p className="max-w-sm text-black/70 leading-relaxed text-sm md:text-base">
            {p.desc[lang]}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/5">
          {p.pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="bg-white p-8 flex flex-col gap-6 hover:bg-[#f5f5f0] transition-colors group"
            >
              <span className="text-4xl font-black text-black/10 group-hover:text-black/20 transition-colors">
                {pillar.number}
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-wide mb-3 text-[#0a0a0a]">
                  {pillar.title[lang]}
                </h3>
                <p className="text-sm text-black/60 leading-relaxed">
                  {pillar.desc[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mascot callout */}
        <div className="mt-16 border border-black/10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <img
            src="/fafabean.png"
            alt="파파빈"
            className="w-24 h-24 object-contain shrink-0"
          />
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-2">
              {p.mascotLabel[lang]}
            </p>
            <h3 className="text-2xl font-bold mb-2 text-[#0a0a0a]">{p.mascotTitle[lang]}</h3>
            <p className="text-black/70 text-sm leading-relaxed max-w-lg">
              {p.mascotDesc[lang]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
