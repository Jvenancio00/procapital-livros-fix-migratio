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
import { EDITORAS } from "@/data/editoras";

export const metadata: Metadata = {
  title: "Editoras | Pro Capital",
  description:
    "Editoras representadas pela Pro Capital, distribuidora de livros em Moçambique e nos países da CPLP.",
};

const COMO_TRABALHAMOS = [
  {
    icon: Globe2,
    title: "Território",
    description:
      "Distribuição em regime de exclusividade em Moçambique, Angola, Portugal, Brasil e demais países da CPLP.",
  },
  {
    icon: Truck,
    title: "Entrega e prazos",
    description:
      "Receção dos produtos no nosso armazém em Maputo, com entrega a clientes em até 24 horas na capital e prazos definidos por região.",
  },
  {
    icon: PackageCheck,
    title: "Consignação",
    description:
      "Coleções elegíveis podem ser trabalhadas em regime de consignação, com prazo padrão de devolução de 90 dias.",
  },
  {
    icon: FileCheck2,
    title: "Relatórios e pagamentos",
    description:
      "Relatórios bimestrais de vendas e stock, com pagamentos à editora no mesmo ciclo.",
  },
];

export default function EditorasPage() {
  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
            Editoras
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Editoras que representamos.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Trabalhamos com editoras nacionais e internacionais para levar um
            catálogo diversificado — de manuais escolares a literatura geral —
            a livrarias, escolas e leitores em Moçambique e nos países da
            CPLP.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {EDITORAS.map((editora) => (
            <EditoraCard key={editora.slug} editora={editora} />
          ))}
        </div>
        <p className="mt-6 text-sm text-foreground/50">
          Lista de editoras em atualização. Contacte-nos para o catálogo
          completo e disponibilidade de títulos.
        </p>
      </section>

      <section className="border-y border-line bg-cream-deep/60">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Como trabalhamos com editoras
          </h2>
          <p className="mt-3 max-w-2xl text-foreground/70">
            Uma parceria de distribuição clara, formalizada em contrato, com
            condições comerciais definidas por coleção.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {COMO_TRABALHAMOS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-cream p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-cream sm:text-3xl">
              É uma editora e quer distribuir connosco?
            </h2>
            <p className="mt-2 max-w-xl text-cream/70">
              Estamos abertos a novas parcerias editoriais em Moçambique e na
              CPLP.
            </p>
          </div>
          <Link
            href="/contactos"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream-deep"
          >
            Propor parceria
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
