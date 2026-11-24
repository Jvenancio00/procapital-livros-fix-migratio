"use client";

import { useLanguage } from "@/context/LanguageContext";

const STOP_WORDS = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "editora",
  "editores",
  "editorial",
  "distribuidora",
  "livros",
  "ltda",
]);

export function editoraInitials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word.toLowerCase()));
  const source = words.length > 0 ? words : name.split(/\s+/);
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase();
  return source
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

// A cor é estável por nome e usa exclusivamente as cores da identidade.
const MARK_COLORS = ["bg-ink", "bg-wine", "bg-brand", "bg-ink-dark"] as const;

export default function EditoraMark({
  name,
  country,
  className = "",
  stacked = false,
}: {
  name: string;
  country?: string;
  className?: string;
  stacked?: boolean;
}) {
  const { dict } = useLanguage();
  const colorIndex = Array.from(name).reduce((hash, char) => (hash * 31 + char.codePointAt(0)!) >>> 0, 0) % MARK_COLORS.length;

  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${stacked ? "flex-col text-center" : "text-left"} ${className}`}>
      <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg ${MARK_COLORS[colorIndex]} text-white`}>
        <span className="font-serif text-sm font-semibold leading-none">{editoraInitials(name)}</span>
        <span className="mt-1.5 h-0.5 w-5 bg-accent" />
      </span>
      <span className="min-w-0 break-words leading-snug">
        <span className="block font-serif text-sm font-semibold text-ink">{name}</span>
        {country && <span className="mt-0.5 block text-[10px] font-medium text-ink/60">{country}</span>}
        <span className="mt-0.5 block text-[10px] text-ink/60">{dict.publisherMark.provisional}</span>
      </span>
    </div>
  );
}
