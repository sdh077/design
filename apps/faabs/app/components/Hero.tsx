"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function Hero() {
  const { lang } = useLanguage();
  const h = t.hero;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 80px),
                            repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 80px)`,
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-8">
          {h.sub[lang]}
        </p>

        <h1 className="text-[clamp(3rem,10vw,9rem)] font-black leading-none tracking-tight uppercase mb-6 text-[#0a0a0a]">
          FAABS
          <br />
          COFFEE
        </h1>

        <p className="text-[clamp(1rem,2.5vw,1.5rem)] text-black/60 tracking-[0.15em] mb-4">
          {h.line1[lang]}
        </p>
        <p className="text-[clamp(1.5rem,4vw,3rem)] font-light tracking-[0.3em] text-black/80 mb-12">
          {h.line2[lang]}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#products"
            className="border border-black px-8 py-3 text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
          >
            {h.cta1[lang]}
          </a>
          <a
            href="https://smartstore.naver.com/faabscoffee"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-black/80 transition-all duration-300"
          >
            {h.cta2[lang]}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-black/70">
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-12 bg-black/20 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1/2 bg-black/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
