"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Lang } from "./translations";

export const SUPPORTED_LANGUAGES: Lang[] = ["ko", "en", "zh"];

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ko",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("faabs-lang") as Lang | null;
    if (saved && (SUPPORTED_LANGUAGES as string[]).includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({
      lang,
      setLang: (l: Lang) => {
        setLangState(l);
        localStorage.setItem("faabs-lang", l);
      },
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
