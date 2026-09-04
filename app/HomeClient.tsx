"use client";

import Link from "next/link";
import { ArrowRight, Handshake, Megaphone, Package, Truck } from "lucide-react";
import BookCard from "@/components/BookCard";
import PartnerMarquee from "@/components/PartnerMarquee";
import PresenceMap from "@/components/PresenceMap";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import AudienceSection from "@/components/AudienceSection";
import TrustBar from "@/components/TrustBar";
import Testimonials from "@/components/Testimonials";
import { BOOKS } from "@/data/books";
import { useLanguage } from "@/context/LanguageContext";

const FUNCOES_ICONS = [Package, Truck, Handshake, Megaphone];

export default function HomeClient({
  featuredBooks,
  bestsellerBooks,
}: {
  featuredBooks: typeof BOOKS;
  bestsellerBooks: typeof BOOKS;
}) {
  const { dict } = useLanguage();

  return (
    <div>
      <HeroSection />

      <section className="border-b border-line bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
          <SearchBar className="mx-auto max-w-2xl" />
        </div>
      </section>

      <TrustBar />

      <PartnerMarquee />

      <section
        id="mais-vendidos"
        className="scroll-mt-24 border-b border-line bg-cream-deep/60"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                {dict.home.bestsellers.eyebrow}
              </span>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                {dict.home.bestsellers.title}
              </h2>
              <p className="mt-3 max-w-2xl text-foreground/70">
                {dict.home.bestsellers.description}
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"
            >
              {dict.home.bestsellers.viewAll}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
            {bestsellerBooks.map((book, index) => (
              <BookCard key={book.slug} book={book} index={index + 4} />
            ))}
          </div>
        </div>
      </section>

      <section id="catalogo" className="scroll-mt-24 border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                {dict.home.catalogSection.eyebrow}
              </span>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                {dict.home.catalogSection.title}
              </h2>
              <p className="mt-3 max-w-2xl text-foreground/70">
                {dict.home.catalogSection.description}
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"
            >
              {dict.home.catalogSection.viewAll}
              <ArrowRight size={15} />
            </Link>
          </div>

          <CategoryGrid />
        </div>
      </section>

      <AudienceSection />

      <section id="destaques" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">
              {dict.home.highlights.eyebrow}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              {dict.home.highlights.title}
            </h2>
            <p className="mt-3 max-w-2xl text-foreground/70">
              {dict.home.highlights.description}
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"
          >
            {dict.home.highlights.viewAll}
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
          {featuredBooks.map((book, index) => (
            <BookCard key={book.slug} book={book} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">
          {dict.home.whatWeDo.eyebrow}
        </span>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          {dict.home.whatWeDo.title}
        </h2>
        <p className="mt-3 max-w-2xl text-foreground/70">
          {dict.home.whatWeDo.description}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {dict.home.whatWeDo.items.map(({ title, description }, index) => {
            const Icon = FUNCOES_ICONS[index];
            return (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-brand/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-serif text-base font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-line bg-cream-deep/60">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <span className="block text-center text-xs font-semibold uppercase tracking-widest text-brand">
            {dict.home.presence.eyebrow}
          </span>
          <h2 className="mt-3 text-center font-serif text-2xl font-semibold text-ink sm:text-3xl">
            {dict.home.presence.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-foreground/70">
            {dict.home.presence.description}
          </p>

          <div className="mt-10">
            <PresenceMap />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {dict.home.presence.countries.map(({ country, note }) => (
              <div
                key={country}
                className="rounded-xl border border-line bg-cream px-4 py-4 text-center"
              >
                <span className="block font-serif text-sm font-semibold text-ink">
                  {country}
                </span>
                <span className="mt-0.5 block text-xs text-foreground/55">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-cream sm:text-3xl">
              {dict.home.ctaBottom.title}
            </h2>
            <p className="mt-2 max-w-xl text-cream/70">
              {dict.home.ctaBottom.description}
            </p>
          </div>
          <Link
            href="/contactos"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark"
          >
            {dict.home.ctaBottom.button}
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="border-t border-cream/10">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h3 className="font-serif text-base font-semibold text-cream">
                {dict.home.newsletter.title}
              </h3>
              <p className="mt-1 text-sm text-cream/60">
                {dict.home.newsletter.description}
              </p>
            </div>
            <form className="flex w-full max-w-sm shrink-0 items-center gap-2 sm:w-auto">
              <input
                type="email"
                required
                placeholder={dict.home.newsletter.placeholder}
                className="w-full min-w-0 rounded-full border border-cream/20 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-brand focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream/90"
              >
                {dict.home.newsletter.button}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
