import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Heart, BookOpen, UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Livro digital | Pro Capital",
  description:
    "Compre livros online, guarde favoritos e aceda à sua biblioteca pessoal na Pro Capital.",
};

const STEPS = [
  {
    icon: ShoppingCart,
    title: "Escolha e compre",
    description:
      "Adicione livros ao carrinho diretamente do catálogo, com preços em Kwanzas, Meticais, Euros ou Reais.",
  },
  {
    icon: Heart,
    title: "Guarde favoritos",
    description:
      "Marque títulos que lhe interessam para decidir com calma mais tarde.",
  },
  {
    icon: UserPlus,
    title: "Crie uma conta",
    description:
      "Registe-se em segundos para guardar o seu histórico e simplificar futuras compras.",
  },
  {
    icon: BookOpen,
    title: "Aceda à sua biblioteca",
    description:
      "Todos os livros comprados ou obtidos gratuitamente ficam reunidos em \"Minha Biblioteca\".",
  },
];

export default function LivroDigitalPage() {
  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
            Livro digital
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            A sua livraria, também online.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Explore o catálogo, compre com poucos cliques e acompanhe tudo
            numa biblioteca pessoal — pensada para leitores em toda a CPLP.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
            >
              Ver catálogo
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/loja/registo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Como funciona
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-line bg-cream p-6"
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
          ))}
        </div>
      </section>
    </div>
  );
}
