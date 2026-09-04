import type { Metadata } from "next";
import { BookMarked, GraduationCap, PenLine, Store, Target, Users, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre nós | Pro Capital",
  description:
    "Conheça a Pro Capital, distribuidora de livros ao serviço de livrarias, escolas e do público em geral em Moçambique e nos países da CPLP.",
};

const PUBLICOS = [
  {
    icon: Store,
    title: "Livrarias",
    description:
      "Fornecemos um catálogo alargado e condições comerciais adaptadas a revendedores em todo o país.",
  },
  {
    icon: GraduationCap,
    title: "Escolas",
    description:
      "Apoiamos instituições de ensino com manuais e material pedagógico, respeitando os prazos do calendário escolar.",
  },
  {
    icon: Users,
    title: "Público em geral",
    description:
      "Ajudamos leitores a encontrar os títulos que procuram, com atendimento próximo e atento.",
  },
];

const BENEFICIOS = [
  {
    icon: BookMarked,
    title: "Para editoras",
    items: [
      "Alcance a livrarias e escolas em Moçambique e na CPLP, sem negociar ponto a ponto",
      "Menos carga logística e administrativa em cada venda",
      "Maior visibilidade dos títulos junto dos nossos parceiros",
    ],
  },
  {
    icon: Store,
    title: "Para livrarias e escolas",
    items: [
      "Um único fornecedor para um catálogo de várias editoras",
      "Condições comerciais claras e consistentes",
      "Apoio próximo na reposição e no acompanhamento de encomendas",
    ],
  },
  {
    icon: PenLine,
    title: "Para autores",
    items: [
      "Maior exposição em diferentes pontos de venda",
      "Chegada mais rápida das obras ao leitor final",
      "Apoio na divulgação de lançamentos",
    ],
  },
];

export default function SobrePage() {
  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
            Sobre nós
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Uma distribuidora de livros com raízes em Moçambique.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            A Pro Capital nasceu em Maputo para aproximar livros e leitores,
            criando pontes entre editoras, livrarias, escolas e o público em
            geral em Moçambique, Angola, Portugal, Brasil e demais países da
            CPLP. Acreditamos que o acesso ao livro certo, no momento certo,
            faz a diferença na formação e no dia a dia das pessoas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-cream-deep/40 p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Target size={20} />
            </span>
            <h2 className="mt-4 font-serif text-xl font-semibold text-ink">
              Missão
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              Distribuir livros de forma eficiente e próxima, garantindo que
              livrarias, escolas e leitores em Moçambique e na CPLP tenham
              acesso a um catálogo diversificado e de qualidade.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-cream-deep/40 p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Eye size={20} />
            </span>
            <h2 className="mt-4 font-serif text-xl font-semibold text-ink">
              Visão
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              Ser a distribuidora de referência para o livro em língua
              portuguesa, reconhecida pela confiança das editoras que
              representa e dos parceiros que serve em Moçambique e na CPLP.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Quem servimos
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PUBLICOS.map(({ icon: Icon, title, description }) => (
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

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Porque trabalhar com uma distribuidora
        </h2>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Uma distribuidora é o elo entre quem publica e quem vende — e isso
          traz vantagens concretas a cada um dos nossos parceiros.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {BENEFICIOS.map(({ icon: Icon, title, items }) => (
            <div key={title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
                {title}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/70">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
