"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function StoreInfo() {
  const { lang } = useLanguage();
  const s = t.store;

  return (
    <section id="store" className="py-32 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-4">
          {s.label[lang]}
        </p>
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-black leading-none uppercase mb-16 text-[#0a0a0a]">
          OUR
          <br />
          <span className="text-black/20">STORES</span>
        </h2>

        <div className="flex flex-col gap-px">
          {s.stores.map((store) => (
            <div
              key={store.name.ko}
              className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5"
            >
              {/* Address */}
              <div className="bg-white p-8 md:p-12 hover:bg-[#f5f5f0] transition-colors">
                <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-6">
                  {s.location[lang]}
                </p>
                <address className="not-italic">
                  <p className="text-xl font-bold mb-1 text-[#0a0a0a]">{store.name[lang]}</p>
                  <p className="text-black/60 text-sm mb-3">{store.area[lang]}</p>
                  <p className="text-black/60 leading-relaxed">{store.address[lang]}</p>
                  {store.phone && (
                    <p className="text-black/60 text-sm mt-2">{store.phone}</p>
                  )}
                </address>
                <div className="flex flex-wrap gap-4 mt-6">
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-black/60 hover:text-black transition-colors border-b border-black/10 hover:border-black pb-1"
                  >
                    {s.naverMap[lang]}
                  </a>
                  <a
                    href={store.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-black/60 hover:text-black transition-colors border-b border-black/10 hover:border-black pb-1"
                  >
                    Instagram →
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="bg-white p-8 md:p-12 hover:bg-[#f5f5f0] transition-colors">
                <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-6">
                  {s.hours[lang]}
                </p>
                <ul className="flex flex-col gap-4">
                  {store.hours.map((h, i) => {
                    const timeText =
                      typeof h.time === "string" ? h.time : h.time[lang];
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between border-b border-black/5 pb-4 last:border-0"
                      >
                        <span className="text-black/70 text-sm">{h.day[lang]}</span>
                        <span
                          className={`font-medium text-sm ${h.closed ? "text-black/20" : "text-[#0a0a0a]"}`}
                        >
                          {timeText}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* SNS */}
        <div className="mt-px bg-[#f5f5f0] p-8 md:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-xs tracking-[0.4em] uppercase text-black/70">
            {s.followUs[lang]}
          </p>
          <div className="flex flex-wrap gap-6 text-sm tracking-widest uppercase">
            <a
              href="https://instagram.com/faabs_coffee_roasters"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/60 hover:text-black transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://smartstore.naver.com/faabscoffee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/60 hover:text-black transition-colors"
            >
              Naver Store
            </a>
            <a
              href="https://www.facebook.com/pages/파브스커피/101885891640321"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black/60 hover:text-black transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
