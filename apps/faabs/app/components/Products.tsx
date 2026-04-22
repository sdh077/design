"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

const products = [
  {
    name: { ko: "파브스 다크 블렌딩", en: "Faabs Dark Blending", zh: "FAABS深度拼配" },
    price: "12,000",
    weight: "200g",
    notes: { ko: "데일리 원두 · 꾸준히 사랑받는", en: "Daily beans · consistently beloved", zh: "日常咖啡豆 · 持续受欢迎" },
    tags: ["BLEND", "DARK"],
    img: "https://shop-phinf.pstatic.net/20250521_7/1747757322739DYE57_PNG/474220885461008_78804855.png",
  },
  {
    name: { ko: "홈타운 블렌드", en: "Hometown Blend", zh: "家乡拼配" },
    price: "16,500",
    weight: "200g",
    notes: { ko: "복숭아 · 리치 · 초콜릿", en: "Peach · Lychee · Chocolate", zh: "桃子 · 荔枝 · 巧克力" },
    tags: ["BLEND", "ESPRESSO"],
    img: "https://shop-phinf.pstatic.net/20250521_273/1747753258034KQ02Q_PNG/30378629882969776_146895103.png",
  },
  {
    name: { ko: "모건타운 블렌드", en: "Morgantown Blend", zh: "摩根敦拼配" },
    price: "13,000",
    weight: "200g",
    notes: { ko: "견과 초콜릿 · 오렌지", en: "Nutty Chocolate · Orange", zh: "坚果巧克力 · 橙子" },
    tags: ["BLEND", "NUTTY"],
    img: "https://shop-phinf.pstatic.net/20250521_236/1747754157773x872v_PNG/1859698847004457_201118725.png",
  },
  {
    name: { ko: "디카페인 원두", en: "Decaf Beans", zh: "低咖啡因豆" },
    price: "14,000",
    weight: "200g",
    notes: { ko: "고소하고 · 부드러운", en: "Nutty · Smooth", zh: "香醇 · 柔顺" },
    tags: ["DECAF", "MILD"],
    img: "https://shop-phinf.pstatic.net/20260418_261/1776470189806dpl4F_PNG/32452906942854090_893820635.png?type=o1000",
  },
];

export default function Products() {
  const { lang } = useLanguage();
  const p = t.products;

  return (
    <section id="products" className="py-32 px-6 md:px-12 bg-[#f5f5f0]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-4">
              {p.label[lang]}
            </p>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black leading-none uppercase text-[#0a0a0a]">
              SIGNATURE
              <br />
              BLENDS
            </h2>
          </div>
          <a
            href="https://smartstore.naver.com/faabscoffee"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto text-sm tracking-widest uppercase text-black/60 hover:text-black border-b border-black/20 hover:border-black pb-1 transition-all"
          >
            {p.viewAll[lang]}
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/5">
          {products.map((product) => (
            <a
              key={product.name.ko}
              href="https://smartstore.naver.com/faabscoffee"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#f5f5f0] flex flex-col hover:bg-white transition-colors overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-square bg-white overflow-hidden flex items-center justify-center p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.img}
                  alt={product.name[lang]}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <div className="flex gap-2 flex-wrap">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-widest text-black/70 border border-black/10 px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-base text-[#0a0a0a]">{product.name[lang]}</h3>
                <p className="text-xs text-black/60 leading-relaxed">
                  {product.notes[lang]}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/5">
                  <span className="text-black/60 text-xs">{product.weight}</span>
                  <span className="font-bold text-[#0a0a0a]">₩{product.price}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
