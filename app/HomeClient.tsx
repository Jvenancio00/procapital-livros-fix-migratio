"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  FileDown,
  FileSpreadsheet,
  GraduationCap,
  Handshake,
  MapPin,
  PackageCheck,
} from "lucide-react";
import type { Book } from "@/data/books";
import type { Editora } from "@/data/editoras";
import BookCard from "@/components/BookCard";
import PublishersCarousel from "@/components/PublishersCarousel";
import HeroSection, { type HeroStats } from "@/components/HeroSection";
import AdvancedSearchBar from "@/components/AdvancedSearchBar";
import CategoryGrid, { type CategorySummaryItem } from "@/components/CategoryGrid";
import AudienceSection from "@/components/AudienceSection";
import FaqSection from "@/components/FaqSection";
import NewsletterForm from "@/components/NewsletterForm";
import { useCurrency } from "@/context/CurrencyContext";
import { MARKET_LIST, MARKETS } from "@/lib/markets";

interface EventSummary {
  slug: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  featured: boolean;
}

interface BlogSummary {
  slug: string;
  title: string;
  summary: string;
  author: string;
  category: string;
  readingTime: number;
  createdAt: string;
}

const SCHOOL_TABS = [
  { code: "ALL", label: "Todos os níveis" },
  { code: "ENSINO_PRIMARIO", label: "Ensino Primário" },
  { code: "ENSINO_SECUNDARIO", label: "Ensino Secundário" },
  { code: "ENSINO_SUPERIOR", label: "Superior & Académico" },
];

export default function HomeClient({
  stats,
  featuredBooks,
  bestsellerBooks,
  schoolBooks,
  categories,
  publishers,
  events,
  posts,
}: {
  stats: HeroStats;
  featuredBooks: Book[];
  bestsellerBooks: Book[];
  schoolBooks: Book[];
  categories: CategorySummaryItem[];
  publishers: Editora[];
  events: EventSummary[];
  posts: BlogSummary[];
}) {
  const { market, setMarket } = useCurrency();
  const [schoolLevel, setSchoolLevel] = useState("ALL");
  const [showcaseTab, setShowcaseTab] = useState<"featured" | "bestsellers">(
    "featured",
  );

  const visibleSchoolBooks = (
    schoolLevel === "ALL"
      ? schoolBooks
      : schoolBooks.filter((b) => b.educationLevel === schoolLevel)
  ).slice(0, 8);

  const activeShowcase =
    showcaseTab === "featured"
      ? featuredBooks.slice(0, 8)
      : bestsellerBooks.slice(0, 8);

  return (
    <div>
      {/* 1. Banner Institucional */}
      <HeroSection featuredBooks={featuredBooks} stats={stats} />

      {/* 2. Pesquisa Avançada de Livros */}
      <section className="border-b border-line/80 bg-cream-deep/55 py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <AdvancedSearchBar categories={categories.map((c) => c.name)} />
        </div>
      </section>

      {/* 3. Destaque Prioritário para Livros Escolares */}
      {schoolBooks.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-18 sm:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2">
                <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Área Comercial Prioritária · Ano Letivo
                </span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Livros escolares e académicos em destaque
              </h2>
              <p className="mt-2.5 text-base leading-relaxed text-ink/70">
                Manuais curriculares, gramáticas e obras de apoio filtráveis por
                país, nível de ensino, classe, disciplina e editora — com encomenda
                direta ou pedido de cotação em quantidade.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {SCHOOL_TABS.map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => setSchoolLevel(tab.code)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    schoolLevel === tab.code
                      ? "bg-ink text-white"
                      : "border border-line bg-white text-ink/75 hover:border-ink/35"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visibleSchoolBooks.map((book, idx) => (
              <BookCard key={book.slug} book={book} index={idx} />
            ))}
          </div>

          <div className="mt-9 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-accent">
                <GraduationCap size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  Encomenda escolar em quantidade para escolas, livrarias e províncias
                </h3>
                <p className="mt-0.5 text-sm text-ink/65">
                  Submeta listas completas por classe ou exporte o catálogo escolar
                  em PDF com preços do mercado {MARKETS[market].name}.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <a
                href={`/api/catalogo/pdf?categoria=Escolar&pais=${market}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-ink/40"
              >
                <FileDown size={14} aria-hidden="true" />
                <span>PDF Escolar ({MARKETS[market].currency})</span>
              </a>
              <Link
                href="/livros-escolares"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <span>Ver todos os livros escolares</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Categorias e Níveis de Ensino */}
      <div className="border-t border-line/70 bg-cream-deep/35">
        <CategoryGrid categories={categories} />
      </div>

      {/* 5. Livros em Destaque e Mais Vendidos */}
      {activeShowcase.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-18 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Curadoria Pro Capital
                </span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {showcaseTab === "featured"
                  ? "Livros em destaque no catálogo"
                  : "Títulos mais procurados na rede"}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-line bg-white p-1">
                <button
                  type="button"
                  onClick={() => setShowcaseTab("featured")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    showcaseTab === "featured"
                      ? "bg-ink text-white"
                      : "text-ink/70 hover:text-ink"
                  }`}
                >
                  Destaques
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseTab("bestsellers")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    showcaseTab === "bestsellers"
                      ? "bg-ink text-white"
                      : "text-ink/70 hover:text-ink"
                  }`}
                >
                  Mais vendidos
                </button>
              </div>

              <Link
                href={showcaseTab === "featured" ? "/destaques" : "/mais-vendidos"}
                className="text-sm font-semibold text-brand hover:text-brand-dark"
              >
                Ver coleção completa →
              </Link>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activeShowcase.map((book, idx) => (
              <BookCard key={book.slug} book={book} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Catálogo de Editoras e Parceiros */}
      <div className="border-t border-line/70">
        <PublishersCarousel publishers={publishers} />
      </div>

      {/* 7. Soluções para Livrarias, Escolas e Instituições */}
      <AudienceSection />

      {/* 8. Destaques Comerciais, Mercados Lusófonos e Oportunidades de Cotação */}
      <section className="mx-auto max-w-7xl px-5 py-18 sm:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          {/* Seletor Interativo de Catálogos Nacionais */}
          <div className="flex flex-col justify-between rounded-3xl border border-line bg-white p-7 sm:p-8 lg:col-span-7">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Catálogos por País &amp; Moeda Local
                </span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                Operação multi-mercado com regras comerciais próprias
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ink/70">
                Alterne o mercado ativo para consultar preços oficiais configurados,
                stock em armazém local, prazos de expedição e meios de pagamento
                disponíveis em cada país.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {MARKET_LIST.map((m) => {
                  const selected = market === m.code;
                  return (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => setMarket(m.code)}
                      className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? "border-brand bg-cream/80 ring-1 ring-brand"
                          : "border-line bg-cream/30 hover:border-ink/30"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-serif text-base font-semibold text-ink">
                          {m.name}
                        </span>
                        <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          {m.currency} ({m.isoCurrency})
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-ink/65">{m.shippingSummary}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line/70 pt-5">
              <Link
                href={`/catalogo?pais=${market}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white hover:bg-ink/90"
              >
                <span>Abrir catálogo de {MARKETS[market].name}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <a
                href={`/api/catalogo/pdf?pais=${market}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand"
              >
                <FileDown size={14} aria-hidden="true" />
                <span>Exportar PDF ({MARKETS[market].name})</span>
              </a>
            </div>
          </div>

          {/* Cartão Comercial de Cotação B2B & Reposição */}
          <div className="flex flex-col justify-between rounded-3xl bg-ink p-7 text-white sm:p-8 lg:col-span-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                <FileSpreadsheet size={13} aria-hidden="true" />
                Canal B2B &amp; Cotação Direta
              </span>

              <h3 className="mt-5 font-serif text-2xl font-semibold leading-snug text-white sm:text-3xl">
                Precisa de proposta formal, fatura proforma ou reposição por lista ISBN?
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Submeta o seu pedido de cotação para títulos com grandes quantidades,
                importação sob encomenda ou fornecimento institucional em Angola,
                Moçambique, Portugal ou Brasil.
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-white/15 pt-5 text-xs text-white/80">
                <li className="flex items-center gap-2">
                  <PackageCheck size={15} className="text-accent" aria-hidden="true" />
                  <span>Reserva automática de stock após validação comercial</span>
                </li>
                <li className="flex items-center gap-2">
                  <Handshake size={15} className="text-accent" aria-hidden="true" />
                  <span>Perfis dedicados para Livrarias, Escolas e Distribuidores</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cotacoes"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <span>Solicitar cotação comercial</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/cliente/catalogo"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:border-accent"
              >
                <span>Tabela B2B rápida</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Eventos, Conteúdos Editoriais e Blog */}
      {(events.length > 0 || posts.length > 0) && (
        <section className="border-t border-line/80 bg-cream-deep/40 py-18">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-12">
              {/* Agenda de Eventos Reais */}
              {events.length > 0 && (
                <div className="lg:col-span-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                        Agenda Cultural &amp; Feiras
                      </span>
                      <h2 className="mt-1.5 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                        Próximos eventos
                      </h2>
                    </div>
                    <Link
                      href="/eventos"
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Ver todos →
                    </Link>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    {events.slice(0, 3).map((ev) => (
                      <Link
                        key={ev.slug}
                        href={`/eventos/${ev.slug}`}
                        className="group block rounded-2xl border border-line bg-white p-5 transition-all hover:border-ink/25 hover:shadow-sm"
                      >
                        <div className="flex flex-wrap items-center gap-3 text-xs text-ink/60">
                          <span className="inline-flex items-center gap-1 font-semibold text-brand">
                            <CalendarDays size={13} aria-hidden="true" />
                            {new Date(ev.startDate).toLocaleDateString("pt-PT", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} aria-hidden="true" />
                            {ev.location}
                          </span>
                        </div>
                        <h3 className="mt-2 font-serif text-lg font-semibold text-ink group-hover:text-brand">
                          {ev.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/65">
                          {ev.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog & Análise Editorial Real */}
              {posts.length > 0 && (
                <div className="lg:col-span-7">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                        Caderno Editorial
                      </span>
                      <h2 className="mt-1.5 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                        Conteúdos e análise do mercado livreiro
                      </h2>
                    </div>
                    <Link
                      href="/blog"
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      Ler todos os artigos →
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-5 transition-all hover:border-ink/25 hover:shadow-sm"
                      >
                        <div>
                          <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                            {post.category}
                          </span>
                          <h3 className="mt-3 line-clamp-3 font-serif text-base font-semibold leading-snug text-ink group-hover:text-brand">
                            {post.title}
                          </h3>
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink/65">
                            {post.summary}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-[11px] font-medium text-ink/55">
                          <span>{post.readingTime} min de leitura</span>
                          <ArrowUpRight
                            size={14}
                            className="text-brand"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 9B. Perguntas Frequentes (SEO & AEO FAQPage) */}
      <div className="border-t border-line/80">
        <FaqSection />
      </div>

      {/* 10. Contactos, Chamada para Parceria e Boletim Editorial */}
      <section className="mx-auto max-w-7xl px-5 py-18 sm:px-8">
        <div className="overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2">
                <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Rede Lusófona &amp; Boletim Comercial
                </span>
              </div>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Quer distribuir a sua editora ou abastecer a sua instituição?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                Fale diretamente com a equipa comercial da Pro Capital para parcerias
                editoriais, acordos com livrarias e fornecimento escolar, ou receba
                novos catálogos e tabelas atualizadas.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contactos?motivo=PARCERIA"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  <span>Solicitar parceria</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <Link
                  href="/contactos"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-accent"
                >
                  <span>Contactar equipa comercial</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 lg:col-span-5">
              <h3 className="font-serif text-lg font-semibold text-white">
                Receber lançamentos e catálogos sazonais
              </h3>
              <p className="mt-1 mb-4 text-xs leading-relaxed text-white/65">
                Notificações sobre novas edições escolares, tabelas de preços e feiras
                do livro. Sem spam.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
