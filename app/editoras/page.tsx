import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  Globe2,
  PackageCheck,
  Truck,
} from "lucide-react";
import EditoraCard from "@/components/EditoraCard";
import PageHeader from "@/components/PageHeader";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editoras & Chancelas Parceiras | Pro Capital",
  description:
    "Diretório de editoras representadas pela Pro Capital nos mercados de língua portuguesa: Angola, Moçambique, Portugal e Brasil.",
};

const COMO_TRABALHAMOS = [
  {
    icon: Globe2,
    title: "Território Lusófono",
    description:
      "Distribuição estruturada em Moçambique, Angola, Portugal e Brasil, com preços oficiais por moeda local.",
  },
  {
    icon: Truck,
    title: "Armazém e Expedição",
    description:
      "Stock controlado por país e armazém, entrega ágil nas capitais e expedição regular para províncias.",
  },
  {
    icon: PackageCheck,
    title: "Importação por ISBN",
    description:
      "Sincronização rápida de catálogos, tabelas de preços e disponibilidade via ficheiros Excel (.xlsx) e CSV.",
  },
  {
    icon: FileCheck2,
    title: "Transparência Comercial",
    description:
      "Relatórios de vendas confirmadas, reserva automática de stock no checkout e geração imediata de catálogos PDF.",
  },
];

export default async function EditorasPage() {
  const [publishers, books] = await Promise.all([
    getAllPublishers(),
    getAllCatalogBooks(),
  ]);

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Representação Editorial"
        title="Editoras e chancelas representadas"
        description="Conetamos editoras escolares, universitárias, infantis e literárias às livrarias, escolas, universidades e leitores nos mercados de língua portuguesa."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Editoras" },
        ]}
        actions={
          <Link
            href="/contactos?motivo=PARCERIA"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <span>Solicitar parceria editorial</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        }
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishers.map((editora) => {
            const count =
              editora.bookCount ??
              books.filter(
                (b) => b.editora.toLowerCase() === editora.name.toLowerCase(),
              ).length;
            return (
              <EditoraCard
                key={editora.slug}
                editora={editora}
                bookCount={count}
              />
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-5 sm:px-8">
        <div className="rounded-3xl border border-line bg-white p-8 sm:p-10">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              Modelo de Distribuição
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
              Como operamos com as editoras parceiras
            </h2>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMO_TRABALHAMOS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-line/80 bg-cream/50 p-5"
                >
                  <Icon size={20} className="text-brand" aria-hidden="true" />
                  <h3 className="mt-3 font-serif text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
