"use client";

import Link from "next/link";
import { BookHeart, GraduationCap, Package, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/data/books";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORY_ICONS = {
  Escolar: GraduationCap,
  Ficção: BookHeart,
  Infantil: Sparkles,
  "Não-ficção": Package,
} as const;

export default function CategoryGrid() {
  const { dict } = useLanguage();

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CATEGORIES.map((category) => {
        const Icon = CATEGORY_ICONS[category];
        return (
          <Link
            key={category}
            href={`/catalogo?categoria=${encodeURIComponent(category)}`}
            className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-cream p-6 text-center transition-colors hover:border-brand/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Icon size={22} />
            </span>
            <span className="font-serif text-base font-semibold text-ink">
              {dict.categories[category]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
