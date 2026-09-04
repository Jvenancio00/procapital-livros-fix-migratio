import type { Dictionary } from "@/lib/i18n/types";
import { pt } from "@/lib/i18n/dictionaries/pt";
import { en } from "@/lib/i18n/dictionaries/en";
import { zh } from "@/lib/i18n/dictionaries/zh";
import { es } from "@/lib/i18n/dictionaries/es";
import { hi } from "@/lib/i18n/dictionaries/hi";
import { fr } from "@/lib/i18n/dictionaries/fr";

export type LanguageCode = "pt" | "en" | "zh" | "es" | "hi" | "fr";

// pt é o idioma nativo do conteúdo do site (mercado CPLP); en funciona como
// idioma de referência/fallback técnico caso uma chave falte nalguma tradução.
export const DEFAULT_LANGUAGE: LanguageCode = "pt";
export const FALLBACK_LANGUAGE: LanguageCode = "en";

export const DICTIONARIES: Record<LanguageCode, Dictionary> = {
  pt,
  en,
  zh,
  es,
  hi,
  fr,
};

export const LANGUAGES: { code: LanguageCode; nativeName: string; flag: string }[] = [
  { code: "pt", nativeName: "Português", flag: "🇲🇿" },
  { code: "en", nativeName: "English", flag: "🇬🇧" },
  { code: "zh", nativeName: "中文", flag: "🇨🇳" },
  { code: "es", nativeName: "Español", flag: "🇪🇸" },
  { code: "hi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "fr", nativeName: "Français", flag: "🇫🇷" },
];

function isLanguageCode(value: string): value is LanguageCode {
  return value in DICTIONARIES;
}

/**
 * Deteta o idioma do navegador do utilizador (navigator.languages) e
 * devolve o primeiro idioma suportado encontrado. Usado apenas no primeiro
 * acesso, antes de existir uma preferência guardada no localStorage.
 */
export function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;

  const candidates =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const raw of candidates) {
    if (!raw) continue;
    const code = raw.slice(0, 2).toLowerCase();
    if (isLanguageCode(code)) return code;
  }

  return DEFAULT_LANGUAGE;
}
