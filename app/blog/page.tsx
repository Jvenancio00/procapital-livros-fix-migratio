import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog | Pro Capital",
  description:
    "Artigos da Pro Capital sobre distribuição de livros, mercado editorial e o setor livreiro em Moçambique e na CPLP.",
};

// Legado: o único artigo publicado antes desta correção, mantido como
// fallback caso a base de dados ainda não tenha sido migrada.
const LEGACY_POSTS = [
  {
    slug: "distribuidora-de-livros-elo-essencial",
    title: "Distribuidora de livros: o elo essencial entre autores, editoras e livrarias",
    excerpt:
      "Como funciona uma distribuidora de livros, que vantagens traz a editoras, livrarias, escolas e autores, e como escolher o parceiro certo.",
    publishedAt: new Date("2026-07-13"),
  },
];

// Corrige a secção Blog: publicar um artigo novo deixa de exigir escrever
// uma página .tsx e fazer deploy — passa a ser uma linha na tabela
// BlogPost (ex.: a partir de um futuro painel admin).
export default async function BlogPage() {
  let posts: { slug: string; title: string; excerpt: string; publishedAt: Date }[] = LEGACY_POSTS;

  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
    });
    if (dbPosts.length > 0) posts = dbPosts;
  } catch {
    // Sem ligação à base de dados — mantém o artigo legado como fallback.
  }

  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
            Blog
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Ideias e novidades sobre o mundo do livro.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Reflexões da Pro Capital sobre distribuição, mercado editorial e o
            setor livreiro em Moçambique e na CPLP.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="divide-y divide-line border-y border-line">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-2 py-8 transition-colors hover:bg-cream-deep/40"
            >
              <h2 className="font-serif text-xl font-semibold text-ink">{post.title}</h2>
              <p className="text-sm text-foreground/70">{post.excerpt}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-foreground/45">
                <span>{new Date(post.publishedAt).toLocaleDateString("pt-PT")}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> leitura rápida
                </span>
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
