"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Lang } from "lib/types";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, zh: string) => string;
}

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (en) => en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("olivia_lang") as Lang | null;
    if (saved) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("olivia_lang", l);
  };

  const t = (en: string, zh: string) => (lang === "zh" ? zh : en);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
