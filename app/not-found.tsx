import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass } from "lucide-react";

// Sem este ficheiro, qualquer endereço errado mostrava o ecrã 404 genérico
// do Next.js, sem cabeçalho, marca ou caminho de saída — má primeira
// impressão para quem chega ao site através de um link partilhado antigo.
export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

const ATALHOS = [
  { href: "/catalogo", label: "Ver o catálogo completo" },
  { href: "/editoras", label: "Editoras que representamos" },
  { href: "/eventos", label: "Próximos eventos" },
  { href: "/contactos", label: "Falar connosco" },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:py-32">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Compass size={28} strokeWidth={1.75} />
      </span>

      <span className="mt-6 inline-block rounded-full bg-cream-deep px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
        Erro 404
      </span>

      <h1 className="mt-5 font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        Não encontrámos esta página
      </h1>

      <p className="mt-4 max-w-md text-foreground/70">
        O endereço pode ter mudado ou o livro que procurava já não está
        disponível. Use a pesquisa do catálogo ou siga um dos atalhos abaixo.
      </p>

      <Link
        href="/catalogo"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
      >
        <BookOpen size={16} />
        Procurar no catálogo
      </Link>

      <ul className="mt-10 grid w-full gap-2 sm:grid-cols-2">
        {ATALHOS.map((atalho) => (
          <li key={atalho.href}>
            <Link
              href={atalho.href}
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              {atalho.label}
              <ArrowRight size={15} className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
