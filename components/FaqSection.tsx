import Link from "next/link";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export const PROCAPITAL_FAQ_ITEMS: FaqItem[] = [
  {
    question: "Em que países e moedas opera a distribuidora Pro Capital?",
    answer:
      "A Pro Capital tem sede operacional na Rua Almeida Garrett, Bairro da Coop, n.º 366, em Maputo (Moçambique), e opera comercialmente em 4 mercados lusófonos: Moçambique (Meticais — MT/MZN), Angola (Kwanzas — KZ/AOA), Portugal (Euros — EUR) e Brasil (Reais — R$/BRL), apresentando preços oficiais definidos por mercado.",
  },
  {
    question:
      "Como pode uma escola, colégio ou universidade encomendar manuais escolares em quantidade?",
    answer:
      "As instituições de ensino podem pesquisar por nível de ensino, classe e disciplina na secção Livros Escolares ou submeter a lista completa por ISBN na Central de Cotações B2B (/cotacoes). A equipa comercial valida stock e envia proposta formal ou fatura proforma em até 24 horas úteis.",
  },
  {
    question: "Quais são os prazos estimados de expedição e entrega?",
    answer:
      "Para títulos com stock ativo nos armazéns locais, a expedição estimada é de 1 a 3 dias úteis nos principais centros urbanos (Maputo, Luanda, Lisboa e São Paulo) e de 3 a 10 dias úteis para as restantes províncias e regiões, conforme indicado em cada mercado no checkout.",
  },
  {
    question:
      "Como pode uma editora ou livraria tornar-se parceira comercial da Pro Capital?",
    answer:
      "Editoras interessadas em representação comercial na CPLP e livrarias que pretendam conta de revenda podem submeter proposta em /contactos ou /convenios, ou contactar diretamente comercial@procapitalmz.com e +258 87 704 6220. Respondemos em até 24 horas úteis.",
  },
  {
    question:
      "Como funcionam os catálogos oficiais em PDF e a Biblioteca Digital Pro Capital?",
    answer:
      "Qualquer visitante pode descarregar gratuitamente o catálogo atualizado em PDF por país ou categoria (com capas, ISBN e preços oficiais). Os leitores registados dispõem ainda da Secção Livro Digital (/livro-digital) e da Minha Biblioteca (/loja/biblioteca) com leitor integrado, modo escuro, marcadores e notas por página.",
  },
];

export default function FaqSection({
  items = PROCAPITAL_FAQ_ITEMS,
  eyebrow = "Perguntas Frequentes",
  title = "Dúvidas frequentes de editoras, livrarias, escolas e leitores",
  emitJsonLd = true,
}: {
  items?: FaqItem[];
  eyebrow?: string;
  title?: string;
  emitJsonLd?: boolean;
}) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      {emitJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              {eyebrow}
            </span>
          </div>
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>

        <Link
          href="/contactos"
          className="text-xs font-semibold text-brand hover:underline"
        >
          Tem outra questão? Fale connosco (resposta até 24h úteis) →
        </Link>
      </div>

      <div className="mt-8 divide-y divide-line/80 rounded-3xl border border-line bg-white px-6 sm:px-8">
        {items.map((item, idx) => (
          <details
            key={item.question}
            open={idx === 0}
            className="group py-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-base font-semibold text-ink marker:hidden sm:text-lg">
              <span>{item.question}</span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className="shrink-0 text-brand transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/75">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
