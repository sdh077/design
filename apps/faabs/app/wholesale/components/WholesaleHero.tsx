"use client";

import { useLanguage } from "../../i18n/LanguageContext";

const copy = {
  label: { ko: "납품 · 도매", en: "Wholesale", zh: "批发合作" },
  desc: {
    ko: "공학적 접근의 로스팅으로 완성된 파브스 커피 원두를 합리적인 가격에 공급합니다. 카페, 레스토랑, 오피스 등 다양한 파트너와 함께합니다.",
    en: "We supply FAABS Coffee beans, crafted through engineering-based roasting, at competitive prices. We partner with cafes, restaurants, offices, and more.",
    zh: "我们以合理的价格提供经过工程化烘焙精制的FAABS咖啡豆，与咖啡馆、餐厅、办公室等各类合作伙伴携手共进。",
  },
  cta: { ko: "납품 문의하기", en: "Inquire Now", zh: "立即咨询" },
  stats: [
    { value: "3+", label: { ko: "년 업력", en: "Years", zh: "年经验" } },
    { value: "20+", label: { ko: "파트너사", en: "Partners", zh: "合作伙伴" } },
    { value: "100%", label: { ko: "스페셜티", en: "Specialty", zh: "精品咖啡" } },
  ],
};

export default function WholesaleHero() {
  const { lang } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col justify-end bg-[#0a0a0a] overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/wholesale/hero.jpg')" }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 to-transparent" />

      {/* Top label */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 md:px-14 pt-28">
        <span className="text-[10px] tracking-[0.5em] uppercase text-white/30">
          {copy.label[lang]}
        </span>
        <span className="text-[10px] tracking-[0.5em] uppercase text-white/30">
          FAABS COFFEE
        </span>
      </div>

      {/* Main content — bottom-left anchored */}
      <div className="relative z-10 px-8 md:px-14 pb-16 md:pb-20">
        {/* Big title */}
        <div className="mb-8">
          <p className="text-[clamp(3.5rem,10vw,9rem)] font-black leading-[0.9] tracking-tighter uppercase text-white">
            WHOLESALE
          </p>
          <p className="text-[clamp(2rem,5.5vw,5rem)] font-light leading-none tracking-[0.15em] text-white/60 mt-2">
            도매 서비스
          </p>
        </div>

        {/* Divider + desc + cta */}
        <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16 border-t border-white/10 pt-8">
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            {copy.desc[lang]}
          </p>
          <div className="flex items-center gap-6 md:ml-auto">
            <a
              href="#contact"
              className="border border-white/60 text-white px-8 py-3.5 text-xs tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all duration-300"
            >
              {copy.cta[lang]}
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-10 mt-10">
          {copy.stats.map((s) => (
            <div key={s.value}>
              <p className="text-2xl md:text-3xl font-black text-white">{s.value}</p>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">
                {s.label[lang]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right side vertical text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
        <div className="w-px h-16 bg-white/10" />
        <p
          className="text-[10px] tracking-[0.4em] uppercase text-white/20"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll to explore
        </p>
        <div className="w-px h-16 bg-white/10" />
      </div>
    </section>
  );
}
