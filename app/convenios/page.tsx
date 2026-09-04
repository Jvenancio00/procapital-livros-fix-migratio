import type { Metadata } from "next";
import {
  GraduationCap,
  School,
  Store,
  BookMarked,
  FileSpreadsheet,
  Percent,
  Truck,
  Headphones,
} from "lucide-react";
import ConvenioForm from "@/components/ConvenioForm";

export const metadata: Metadata = {
  title: "Convénios | Pro Capital",
  description:
    "Condições comerciais para escolas, universidades, livrarias e editoras que trabalham com a Pro Capital em Moçambique e na CPLP.",
};

const PUBLICOS = [
  {
    icon: School,
    title: "Escolas",
    beneficios: [
      "Preços por volume para adoção de manuais escolares",
      "Prazos de entrega alinhados ao calendário letivo",
      "Faturação centralizada por instituição",
    ],
  },
  {
    icon: GraduationCap,
    title: "Universidades",
    beneficios: [
      "Bibliografia de referência com condições de compra recorrente",
      "Apoio à biblioteca com listas de leitura por curso",
      "Possibilidade de licenciamento digital para uso académico",
    ],
  },
  {
    icon: Store,
    title: "Livrarias",
    beneficios: [
      "Margem de revenda competitiva",
      "Reposição facilitada via encomenda expresso",
      "Catálogo alargado de editoras da CPLP",
    ],
  },
  {
    icon: BookMarked,
    title: "Editoras",
    beneficios: [
      "Distribuição em Moçambique e nos mercados da CPLP",
      "Presença no catálogo digital e físico da Pro Capital",
      "Relatórios de vendas por título",
    ],
  },
] as const;

const VANTAGENS = [
  {
    icon: Percent,
    title: "Condições comerciais dedicadas",
    description: "Tabela de preços por escalão, ajustada ao volume e à recorrência da instituição.",
  },
  {
    icon: Truck,
    title: "Logística simplificada",
    description: "Entregas coordenadas com antecedência, com um único ponto de contacto.",
  },
  {
    icon: FileSpreadsheet,
    title: "Faturação e relatórios",
    description: "Documentação organizada por período, pronta para os processos internos da instituição.",
  },
  {
    icon: Headphones,
    title: "Acompanhamento próximo",
    description: "Uma pessoa da nossa equipa comercial acompanha o convénio do início ao fim.",
  },
] as const;

export default function ConveniosPage() {
  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
            Convénios
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Condições especiais para compra recorrente.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Trabalhamos com escolas, universidades, livrarias e editoras que
            precisam de um parceiro estável para o fornecimento de livros —
            com preços, prazos e faturação pensados para necessidades
            recorrentes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          O que ganha ao entrar num convénio
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLICOS.map(({ icon: Icon, title, beneficios }) => (
            <div key={title} className="rounded-2xl border border-line bg-cream p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-serif text-base font-semibold text-ink">
                {title}
              </h3>
              <ul className="mt-3 space-y-2">
                {beneficios.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-foreground/70">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-cream-deep/40">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Como funciona um convénio Pro Capital
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {VANTAGENS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-line bg-cream p-6">
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
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Solicitar convénio
        </h2>
        <p className="mt-2 text-sm text-foreground/70">
          Preencha os dados da sua instituição — respondemos em até 2 dias
          úteis com uma proposta de condições comerciais.
        </p>
        <div className="mt-8">
          <ConvenioForm />
        </div>
      </section>
    </div>
  );
}
