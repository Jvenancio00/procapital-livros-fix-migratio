import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Building2,
  Eye,
  Globe2,
  GraduationCap,
  PenLine,
  Store,
  Target,
  Users,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import FaqSection from "@/components/FaqSection";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre a Pro Capital — Distribuição Editorial Lusófona",
  description:
    "Conheça a Pro Capital — Distribuidora de Livros sediada em Maputo, com operação comercial e logística editorial para Moçambique, Angola, Portugal e Brasil.",
  alternates: { canonical: `${SITE_URL}/sobre` },
  openGraph: {
    title: "Sobre a Pro Capital — Distribuição Editorial Lusófona | Pro Capital",
    description:
      "Distribuidora editorial de manuais escolares, literatura e obras académicas em Moçambique, Angola, Portugal e Brasil.",
    url: `${SITE_URL}/sobre`,
    images: [DEFAULT_OG_IMAGE],
  },
};

const PUBLICOS = [
  {
    icon: Store,
    title: "Livrarias e Revendedores",
    description:
      "Fornecimento consolidado multimarca, condições comerciais por perfil revendedor e reposição ágil por país.",
  },
  {
    icon: GraduationCap,
    title: "Escolas e Instituições",
    description:
      "Atendimento prioritário ao livro escolar e académico por classe, disciplina e ano letivo com cotações formais.",
  },
  {
    icon: Users,
    title: "Leitores e Bibliotecas",
    description:
      "Acesso direto a obras literárias, técnicas, infantis e académicas com disponibilidade transparente por mercado.",
  },
];

const BENEFICIOS = [
  {
    icon: BookMarked,
    title: "Para Editoras Parceiras",
    items: [
      "Presença estruturada em Angola, Moçambique, Portugal e Brasil",
      "Controlo rigoroso de stock por armazém e relatórios comerciais claros",
      "Catálogos PDF institucionais e visibilidade editorial qualificada",
    ],
  },
  {
    icon: Store,
    title: "Para Livrarias e Escolas",
    items: [
      "Um único interlocutor comercial para múltiplas chancelas editoriais",
      "Pesquisa imediata por ISBN, nível de ensino, classe e disciplina",
      "Faturação proforma, histórico auditável e repetição rápida de encomendas",
    ],
  },
  {
    icon: PenLine,
    title: "Para Autores e Cultura",
    items: [
      "Circulação efetiva das obras entre os mercados de língua portuguesa",
      "Agenda ativa de lançamentos, feiras do livro e encontros literários",
      "Valorização editorial séria de cada obra representada",
    ],
  },
];

export default async function SobrePage() {
  const [books, publishers] = await Promise.all([
    getAllCatalogBooks(),
    getAllPublishers(),
  ]);

  const schoolCount = books.filter(
    (b) => b.category === "Escolar" || Boolean(b.educationLevel),
  ).length;

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre a Pro Capital — Distribuidora Editorial",
    url: `${SITE_URL}/sobre`,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <div className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <PageHeader
        eyebrow="Institucional · Pro Capital"
        title="A distribuição editorial que aproxima editoras, escolas, livrarias e leitores"
        description="Com sede operacional na Rua Almeida Garrett, n.º 366, em Maputo, e rede comercial vocacionada para Moçambique, Angola, Portugal e Brasil, unimos curadoria editorial, rigor logístico e soluções B2B modernas."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Sobre nós" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Indicadores Reais Verificados da Rede Pro Capital */}
        <dl className="mb-12 grid grid-cols-2 gap-4 rounded-3xl border border-line bg-white p-6 sm:grid-cols-4 sm:p-8">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/55">
              <Building2 size={14} className="text-brand" aria-hidden="true" />
              <span>Editoras parceiras</span>
            </dt>
            <dd className="mt-1.5 font-serif text-3xl font-semibold text-ink">
              {publishers.length}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/55">
              <BookOpen size={14} className="text-brand" aria-hidden="true" />
              <span>Títulos no catálogo</span>
            </dt>
            <dd className="mt-1.5 font-serif text-3xl font-semibold text-ink">
              {books.length}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/55">
              <GraduationCap size={14} className="text-brand" aria-hidden="true" />
              <span>Manuais escolares</span>
            </dt>
            <dd className="mt-1.5 font-serif text-3xl font-semibold text-ink">
              {schoolCount}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink/55">
              <Globe2 size={14} className="text-brand" aria-hidden="true" />
              <span>Mercados CPLP</span>
            </dt>
            <dd className="mt-1.5 font-serif text-3xl font-semibold text-ink">
              4 países
            </dd>
          </div>
        </dl>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Target size={20} />
            </span>
            <h2 className="mt-4 font-serif text-xl font-semibold text-ink">
              Missão
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink/70">
              Assegurar uma distribuição editorial eficiente, transparente e
              próxima nos mercados lusófonos, garantindo que escolas, livrarias,
              instituições e leitores acedem ao livro certo no tempo certo.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Eye size={20} />
            </span>
            <h2 className="mt-4 font-serif text-xl font-semibold text-ink">
              Visão
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink/70">
              Consolidar a referência comercial e logística para o livro em
              língua portuguesa, reconhecida pela confiança das editoras
              representadas e pela excelência de serviço aos parceiros B2B e
              leitores.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Quem Servimos
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {PUBLICOS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 font-serif text-base font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink/70">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Compromisso na Cadeia do Livro
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {BENEFICIOS.map(({ icon: Icon, title, items }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 font-serif text-base font-semibold text-ink">
                  {title}
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink/70">
                  {items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-ink p-8 text-white sm:p-10">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl font-semibold text-white">
              Pretende distribuir a sua editora ou abastecer a sua escola?
            </h2>
            <p className="mt-2 text-sm text-white/75">
              Fale diretamente com a nossa direção comercial para abertura de
              conta parceira, tabelas por volume ou envio de catálogo PDF —
              respondemos em até 24 horas úteis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cotacoes?tipo=parceria"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              <span>Solicitar parceria</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs font-semibold text-white hover:bg-white/10"
            >
              <span>Explorar catálogo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Perguntas Frequentes com Schema FAQPage */}
      <FaqSection />
    </div>
  );
}
