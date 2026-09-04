"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Barra de pesquisa da homepage.
 * Submete um GET simples para /catalogo?busca=..., onde o CatalogGrid
 * lê o parâmetro "busca" e filtra por título, autor ou categoria.
 */
export default function SearchBar({ className = "" }: { className?: string }) {
  const { dict } = useLanguage();

  return (
    <form
      action="/catalogo"
      method="GET"
      role="search"
      className={`flex w-full items-center gap-2 rounded-full border border-line bg-cream p-1.5 shadow-sm transition-shadow focus-within:shadow-md sm:gap-3 ${className}`}
    >
      <div className="relative flex-1">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40"
        />
        <input
          type="search"
          name="busca"
          placeholder={dict.search.placeholder}
          className="w-full rounded-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-foreground/40 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
      >
        {dict.search.button}
      </button>
    </form>
  );
}
