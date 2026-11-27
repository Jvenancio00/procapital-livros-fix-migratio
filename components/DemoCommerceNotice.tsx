"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function DemoCommerceNotice() {
  const { dict } = useLanguage();
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <h1 className="font-serif text-3xl font-semibold text-ink">{dict.demo.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-ink/75">{dict.demo.description}</p>
      <div className="mt-7 flex flex-wrap gap-4">
        <Link href="/catalogo" className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark">{dict.hero.ctaCatalog}</Link>
        <Link href="/contactos" className="rounded-md border border-line px-5 py-3 text-sm font-semibold text-ink hover:border-brand">{dict.demo.contact}</Link>
      </div>
    </section>
  );
}
