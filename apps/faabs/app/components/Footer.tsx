"use client";

import { useLanguage } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-black/5 px-6 md:px-12 py-10 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] uppercase mb-1 text-[#0a0a0a]">
            FAABS Coffee
          </p>
          <p className="text-xs text-black/70">{t.footer.address[lang]}</p>
        </div>
        <p className="text-xs text-black/70">
          © 2025 FAABS Coffee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
