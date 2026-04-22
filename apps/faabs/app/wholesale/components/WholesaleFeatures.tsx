"use client";

import { useLanguage } from "../../i18n/LanguageContext";

const copy = {
  label: { ko: "왜 파브스인가", en: "Why FAABS", zh: "为什么选择FAABS" },
  features: [
    {
      icon: "⚙️",
      title: { ko: "공학적 로스팅", en: "Engineering Roasting", zh: "工程化烘焙" },
      desc: {
        ko: "데이터 기반의 정밀한 로스팅으로 매 배치마다 일관된 품질을 보장합니다.",
        en: "Precision roasting backed by data ensures consistent quality in every batch.",
        zh: "以数据为基础的精密烘焙，保证每批次品质稳定一致。",
      },
    },
    {
      icon: "🚚",
      title: { ko: "정기 납품", en: "Regular Supply", zh: "定期供货" },
      desc: {
        ko: "정기적인 납품 스케줄로 재고 걱정 없이 운영하세요.",
        en: "Operate without inventory worries with a reliable regular delivery schedule.",
        zh: "按时定期供货，让您无需为库存烦恼，专注经营。",
      },
    },
    {
      icon: "☕",
      title: { ko: "캘리브레이션 지원", en: "Calibration Support", zh: "校准支持" },
      desc: {
        ko: "납품 원두에 맞는 에스프레소 레시피와 추출 세팅을 함께 제공합니다.",
        en: "We provide espresso recipes and extraction settings tailored to the supplied beans.",
        zh: "提供与供应咖啡豆匹配的浓缩咖啡配方和萃取参数设置。",
      },
    },
    {
      icon: "🤝",
      title: { ko: "파트너 성장", en: "Partner Growth", zh: "共同成长" },
      desc: {
        ko: "단순 공급을 넘어 파트너의 성장을 함께 고민하는 커피 파트너입니다.",
        en: "More than just a supplier — a coffee partner invested in your growth.",
        zh: "不仅仅是供应商，更是与您共同谋划发展的咖啡合作伙伴。",
      },
    },
  ],
};

export default function WholesaleFeatures() {
  const { lang } = useLanguage();

  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-4">
          {copy.label[lang]}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-16">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-square bg-[#f0f0eb] overflow-hidden relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/wholesale/feature-${n}.jpg`}
                alt={`FAABS wholesale ${n}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-black/20 text-xs tracking-widest">
                {`feature-${n}.jpg`}
              </div>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/5">
          {copy.features.map((f) => (
            <div
              key={f.title.ko}
              className="bg-white p-8 flex flex-col gap-4 hover:bg-[#f5f5f0] transition-colors"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold text-base text-[#0a0a0a]">{f.title[lang]}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{f.desc[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
