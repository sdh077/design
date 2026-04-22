"use client";

import { useState, type ReactNode } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { SUPPORTED_LANGUAGES } from "../i18n/LanguageContext";
import { t, type Lang } from "../i18n/translations";

const langLabels: Record<Lang, string> = { ko: "KO", en: "EN", zh: "ZH" };

function LanguageSwitcher({ size = "md" }: { size?: "sm" | "md" }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-1 border border-black/10 p-0.5">
      {SUPPORTED_LANGUAGES.map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`transition-all ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"} ${
            lang === code ? "bg-black text-white" : "text-black/60 hover:text-black"
          }`}
        >
          {langLabels[code]}
        </button>
      ))}
    </div>
  );
}

export default function Header({ authSlot }: { authSlot?: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang } = useLanguage();
  const nav = t.header;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-white/90 backdrop-blur-sm border-b border-black/5">
      <a href="/" className="text-xl font-bold tracking-[0.2em] uppercase text-[#0a0a0a]">
        FAABS
      </a>

      <nav className="hidden md:flex items-center gap-8 text-sm tracking-widest uppercase text-black/70">
        <a href="/wholesale" className="hover:text-black transition-colors">
          {nav.wholesale[lang]}
        </a>
        <a
          href="https://smartstore.naver.com/faabscoffee"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-black/60 px-4 py-1.5 hover:bg-black hover:text-white transition-all"
        >
          {nav.shop[lang]}
        </a>
        {authSlot}
        <LanguageSwitcher />
      </nav>

      <div className="flex md:hidden items-center gap-3">
        <LanguageSwitcher size="sm" />
        <button
          className="flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          <span className={`block w-6 h-px bg-black transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-px bg-black transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-black transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-black/10 flex flex-col items-center gap-8 py-10 text-sm tracking-widest uppercase text-black/70 md:hidden">
          <a href="/wholesale" onClick={() => setMenuOpen(false)}>{nav.wholesale[lang]}</a>
          <a href="https://smartstore.naver.com/faabscoffee" target="_blank" rel="noopener noreferrer">
            {nav.shop[lang]}
          </a>
          {authSlot}
        </div>
      )}
    </header>
  );
}
