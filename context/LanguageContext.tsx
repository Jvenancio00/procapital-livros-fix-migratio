"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Dictionary } from "@/lib/i18n/types";
import {
  DEFAULT_LANGUAGE,
  DICTIONARIES,
  detectBrowserLanguage,
  type LanguageCode,
} from "@/lib/i18n/languages";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "procapital-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  // Hidratação única: usa a preferência guardada, ou deteta o idioma do
  // navegador no primeiro acesso (quando ainda não há nada guardado).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && stored in DICTIONARIES) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação única a partir do localStorage
        setLanguageState(stored);
      } else {
        setLanguageState(detectBrowserLanguage());
      }
    } catch {
      // localStorage indisponível — mantém o idioma padrão
    }
  }, []);

  // Mantém o atributo lang do <html> sincronizado com o idioma ativo
  useEffect(() => {
    document.documentElement.lang = DICTIONARIES[language].meta.htmlLang;
  }, [language]);

  const setLanguage = (value: LanguageCode) => {
    setLanguageState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // armazenamento indisponível
    }
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, dict: DICTIONARIES[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage deve ser usado dentro de <LanguageProvider>");
  return ctx;
}
