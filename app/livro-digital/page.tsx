import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart, ShoppingCart, UserPlus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Biblioteca & Leitura Digital | Pro Capital",
  description:
    "Adquira obras no catálogo Pro Capital, guarde favoritos e aceda à sua biblioteca digital pessoal.",
};

const STEPS = [
  {
    icon: ShoppingCart,
    title: "Escolha no catálogo por país",
    description:
      "Consulte disponibilidade e preços oficiais em Kwanzas (KZ), Meticais (MT), Euros (€) ou Reais (R$).",
  },
  {
    icon: Heart,
    title: "Organize os seus favoritos",
    description:
      "Guarde títulos escolares, técnicos ou literários para preparar compras individuais ou institucionais.",
  },
  {
    icon: UserPlus,
    title: "Crie a sua conta Pro Capital",
    description:
      "Registe-se como leitor particular, escola, livraria, editora ou empresa para centralizar encomendas.",
  },
  {
    icon: BookOpen,
    title: "Leia e anote na Biblioteca Digital",
    description:
      "Aceda aos títulos digitais adquiridos com leitor integrado e registo pessoal de notas por página.",
  },
];

export default function LivroDigitalPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Leitura & Acervo Digital"
        title="A Sua Biblioteca Digital Pro Capital"
        description="Acesso simples e seguro a edições digitais, anotações de estudo e histórico completo de aquisições em qualquer dispositivo."
      />

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-line bg-white p-6"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-serif text-base font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <span>Explorar catálogo</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/loja/biblioteca"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-xs font-semibold text-ink hover:border-brand/40"
          >
            <span>Abrir Minha Biblioteca</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
