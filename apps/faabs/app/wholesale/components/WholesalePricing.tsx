"use client";

import { useLanguage } from "../../i18n/LanguageContext";
import type { Lang } from "../../i18n/translations";

type TierStyle = "default" | "dark" | "accent";

const styleMap: Record<TierStyle, {
  card: string; sub: string; feat: string; dash: string; btn: string; badge: string; badgeLabel: string;
}> = {
  default: {
    card: "bg-white text-[#0a0a0a]",
    sub: "text-black/70",
    feat: "text-black/70",
    dash: "text-black/20",
    btn: "border border-black/20 hover:bg-black hover:text-white",
    badge: "",
    badgeLabel: "",
  },
  dark: {
    card: "bg-[#0a0a0a] text-white",
    sub: "text-white/60",
    feat: "text-white/70",
    dash: "text-white/25",
    btn: "bg-white text-black hover:bg-white/90",
    badge: "bg-white text-black",
    badgeLabel: "Popular",
  },
  accent: {
    card: "bg-[#3b2a1a] text-[#f5ede3]",
    sub: "text-[#c9a882]/60",
    feat: "text-[#f5ede3]/70",
    dash: "text-[#c9a882]/40",
    btn: "bg-[#c9a882] text-[#3b2a1a] hover:bg-[#d4b896]",
    badge: "bg-[#c9a882] text-[#3b2a1a]",
    badgeLabel: "Premium",
  },
};

const ctaLabel: Record<Lang, string> = { ko: "문의하기", en: "Inquire", zh: "立即咨询" };

const copy = {
  label: { ko: "납품 요금", en: "Pricing", zh: "价格方案" },
  title: { ko: "합리적인 도매 가격", en: "Competitive Wholesale Pricing", zh: "合理的批发价格" },
  desc: {
    ko: "정확한 납품 단가는 물량, 품목, 배송 조건에 따라 달라집니다. 아래는 참고용 구간 가격입니다.",
    en: "Exact wholesale prices vary by volume, product, and delivery terms. The tiers below are for reference.",
    zh: "具体批发单价因数量、品类及配送条件而异，以下为参考价格区间。",
  },
  tiers: [
    {
      name: { ko: "스타터", en: "Starter", zh: "入门套餐" },
      amount: { ko: "월 5kg 미만", en: "Under 5kg/mo", zh: "月用量5kg以下" },
      price: { ko: "가격 문의", en: "Contact for price", zh: "价格请咨询" },
      features: {
        ko: ["추출 세팅 가이드 제공", "2주 단위 납품", "기본 블렌드 선택"],
        en: ["Extraction setup guide", "Bi-weekly delivery", "Basic blend selection"],
        zh: ["提供萃取设置指南", "两周一次供货", "基础拼配选择"],
      },
      style: "default" as TierStyle,
    },
    {
      name: { ko: "파트너", en: "Partner", zh: "合作套餐" },
      amount: { ko: "월 5–20kg", en: "5–20kg/mo", zh: "月用量5–20kg" },
      price: { ko: "가격 문의", en: "Contact for price", zh: "价格请咨询" },
      features: {
        ko: ["1:1 캘리브레이션 지원", "주 단위 납품", "블렌드 커스터마이징", "바리스타 트레이닝 1회"],
        en: ["1:1 calibration support", "Weekly delivery", "Blend customization", "1 barista training session"],
        zh: ["一对一校准支持", "每周供货", "拼配定制化", "1次咖啡师培训"],
      },
      style: "dark" as TierStyle,
    },
    {
      name: { ko: "엔터프라이즈", en: "Enterprise", zh: "企业套餐" },
      amount: { ko: "월 20kg 이상", en: "20kg+/mo", zh: "月用量20kg以上" },
      price: { ko: "가격 문의", en: "Contact for price", zh: "价格请咨询" },
      features: {
        ko: ["전담 담당자 배정", "탄력적 납품 일정", "전체 메뉴 컨설팅", "정기 품질 점검"],
        en: ["Dedicated account manager", "Flexible delivery schedule", "Full menu consulting", "Regular quality checks"],
        zh: ["专属客户经理", "灵活供货计划", "全菜单咨询", "定期品质检查"],
      },
      style: "accent" as TierStyle,
    },
  ],
  ctaNote: {
    ko: "* 모든 가격은 협의 후 확정됩니다. 납품 문의는 아래 양식을 이용해주세요.",
    en: "* All prices are confirmed after consultation. Please use the form below for wholesale inquiries.",
    zh: "* 所有价格需经协商后确定，批发咨询请使用下方表格。",
  },
};

export default function WholesalePricing() {
  const { lang } = useLanguage();

  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-4">
          {copy.label[lang]}
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-tight uppercase text-[#0a0a0a]">
            {copy.title[lang]}
          </h2>
          <p className="max-w-sm text-black/70 text-sm leading-relaxed">
            {copy.desc[lang]}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/5">
          {copy.tiers.map((tier) => {
            const st = styleMap[tier.style];
            return (
              <div key={tier.name.ko} className={`p-8 md:p-10 flex flex-col gap-6 ${st.card}`}>
                {st.badgeLabel && (
                  <span className={`self-start text-[10px] tracking-widest uppercase px-2 py-0.5 ${st.badge}`}>
                    {st.badgeLabel}
                  </span>
                )}
                <div>
                  <p className={`text-xs tracking-widest uppercase mb-1 ${st.sub}`}>{tier.amount[lang]}</p>
                  <h3 className="text-2xl font-black uppercase">{tier.name[lang]}</h3>
                </div>
                <div className="text-2xl font-bold">{tier.price[lang]}</div>
                <ul className="flex flex-col gap-3 flex-1">
                  {tier.features[lang].map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${st.feat}`}>
                      <span className={`mt-0.5 shrink-0 ${st.dash}`}>—</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-4 block text-center py-3 text-sm tracking-widest uppercase transition-all ${st.btn}`}
                >
                  {ctaLabel[lang]}
                </a>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-black/70 text-center">{copy.ctaNote[lang]}</p>
      </div>
    </section>
  );
}
