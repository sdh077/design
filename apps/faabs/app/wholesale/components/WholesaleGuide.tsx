"use client";

import { useLanguage } from "../../i18n/LanguageContext";

const copy = {
  label: { ko: "에스프레소 추출 가이드", en: "Espresso Extraction Guide", zh: "浓缩咖啡萃取指南" },
  title: { ko: "납품 원두 세팅 가이드", en: "Extraction Setup Guide", zh: "供货咖啡豆设置指南" },
  desc: {
    ko: "파브스 커피 납품 원두에 최적화된 에스프레소 추출 레시피입니다. 장비 세팅부터 추출까지 함께 지원합니다.",
    en: "Optimized espresso extraction recipes for FAABS wholesale beans. We support everything from equipment setup to extraction.",
    zh: "专为FAABS批发咖啡豆优化的浓缩咖啡萃取配方，从设备调试到萃取全程支持。",
  },
  specs: {
    title: { ko: "기본 장비 세팅", en: "Basic Equipment Settings", zh: "基本设备参数" },
    items: [
      { label: { ko: "포타필터", en: "Portafilter", zh: "手柄" }, value: { ko: "58mm", en: "58mm", zh: "58mm" } },
      { label: { ko: "추출 온도", en: "Extraction Temp", zh: "萃取温度" }, value: { ko: "93°C", en: "93°C", zh: "93°C" } },
      { label: { ko: "보일러 온도", en: "Boiler Temp", zh: "锅炉温度" }, value: { ko: "118°C", en: "118°C", zh: "118°C" } },
      { label: { ko: "압력", en: "Pressure", zh: "压力" }, value: { ko: "9 bar", en: "9 bar", zh: "9 bar" } },
      { label: { ko: "프리인퓨전", en: "Pre-infusion", zh: "预浸泡" }, value: { ko: "없음", en: "None", zh: "无" } },
      { label: { ko: "탬핑", en: "Tamping", zh: "填压" }, value: { ko: "플랫 탬퍼 권장", en: "Flat tamper recommended", zh: "建议平底填压器" } },
    ],
  },
  recipes: {
    title: { ko: "추출 레시피", en: "Extraction Recipes", zh: "萃取配方" },
    basketNote: { ko: "바스켓 선택에 따라 풍미가 달라집니다", en: "Flavor varies by basket selection", zh: "根据粉碗选择风味有所不同" },
    cols: {
      basket: { ko: "바스켓", en: "Basket", zh: "粉碗" },
      dose: { ko: "도징", en: "Dose", zh: "粉量" },
      yield: { ko: "추출량", en: "Yield", zh: "出液量" },
      time: { ko: "추출 시간", en: "Time", zh: "萃取时间" },
      note: { ko: "특징", en: "Note", zh: "特点" },
    },
    rows: [
      {
        basket: "Microhole 18G",
        dose: "18g",
        yield: "38–40g",
        time: "25–31s",
        note: { ko: "개성 강조", en: "Character-forward", zh: "突出个性" },
      },
      {
        basket: "IMS 18G",
        dose: "18g",
        yield: "36–38g",
        time: "26–32s",
        note: { ko: "바디감 강조", en: "Body-forward", zh: "突出醇厚度" },
      },
      {
        basket: "Microhole 20G",
        dose: "20g",
        yield: "40–44g",
        time: "27–33s",
        note: { ko: "균형잡힌 추출", en: "Balanced extraction", zh: "均衡萃取" },
      },
    ],
  },
  tips: {
    title: { ko: "추출 팁", en: "Extraction Tips", zh: "萃取技巧" },
    items: [
      {
        ko: "디스트리뷰터 깊이는 6–7mm를 권장합니다.",
        en: "Distributor depth of 6–7mm is recommended.",
        zh: "建议布粉器深度为6–7mm。",
      },
      {
        ko: "압력보다 레벨링이 더 중요합니다. 균일한 분포를 우선시하세요.",
        en: "Leveling is more important than pressure. Prioritize even distribution.",
        zh: "水平分布比压力更重要，请优先确保均匀布粉。",
      },
      {
        ko: "저울 정밀도는 최소 0.1g을 권장합니다.",
        en: "Scale precision of at least 0.1g is recommended.",
        zh: "建议使用精度至少0.1g的电子秤。",
      },
      {
        ko: "원두 신선도 유지 기간: 로스팅 후 4–17일이 최적입니다.",
        en: "Optimal bean freshness: 4–17 days after roasting.",
        zh: "咖啡豆最佳赏味期：烘焙后4–17天。",
      },
    ],
  },
};

export default function WholesaleGuide() {
  const { lang } = useLanguage();
  const g = copy;

  return (
    <section className="py-24 px-6 md:px-12 bg-[#f5f5f0]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-4">
          {g.label[lang]}
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-tight uppercase text-[#0a0a0a]">
            {g.title[lang]}
          </h2>
          <p className="max-w-sm text-black/70 text-sm leading-relaxed">
            {g.desc[lang]}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-black/5 mb-px">
          {/* Equipment specs */}
          <div className="bg-white p-8 md:p-10">
            <h3 className="font-bold text-base mb-6 tracking-wide">
              {g.specs.title[lang]}
            </h3>
            <ul className="flex flex-col gap-3">
              {g.specs.items.map((item, i) => (
                <li key={i} className="flex justify-between items-center border-b border-black/5 pb-3 last:border-0">
                  <span className="text-sm text-black/70">{item.label[lang]}</span>
                  <span className="text-sm font-medium text-[#0a0a0a]">{item.value[lang]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Extraction tips */}
          <div className="bg-white p-8 md:p-10">
            <h3 className="font-bold text-base mb-6 tracking-wide">
              {g.tips.title[lang]}
            </h3>
            <ul className="flex flex-col gap-4">
              {g.tips.items.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-black/60 leading-relaxed">
                  <span className="text-black/20 font-bold shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  {tip[lang]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recipe table */}
        <div className="bg-white p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base tracking-wide">{g.recipes.title[lang]}</h3>
            <p className="text-xs text-black/70">{g.recipes.basketNote[lang]}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10">
                  {Object.values(g.recipes.cols).map((col) => (
                    <th key={col.ko} className="text-left py-3 pr-6 text-xs tracking-widest uppercase text-black/70 font-normal">
                      {col[lang]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.recipes.rows.map((row, i) => (
                  <tr key={i} className="border-b border-black/5 last:border-0 hover:bg-[#f5f5f0] transition-colors">
                    <td className="py-4 pr-6 font-medium text-[#0a0a0a]">{row.basket}</td>
                    <td className="py-4 pr-6 text-black/60">{row.dose}</td>
                    <td className="py-4 pr-6 text-black/60">{row.yield}</td>
                    <td className="py-4 pr-6 text-black/60">{row.time}</td>
                    <td className="py-4 text-black/70 text-xs">{row.note[lang]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
