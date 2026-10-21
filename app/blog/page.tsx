import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Caderno Editorial | Pro Capital",
  description:
    "Artigos da Pro Capital sobre distribuição de livros, ensino, mercado editorial e o setor livreiro em Angola, Moçambique, Portugal e Brasil.",
};

const LEGACY_POSTS = [
  {
    slug: "distribuidora-de-livros-elo-essencial",
    title:
      "Distribuidora de livros: o elo essencial entre autores, editoras e livrarias",
    excerpt:
      "Como funciona uma distribuidora de livros, que vantagens traz a editoras, livrarias, escolas e autores, e como escolher o parceiro certo.",
    publishedAt: new Date("2026-07-13"),
  },
];

export default async function BlogPage() {
  let posts: { slug: string; title: string; excerpt: string; publishedAt: Date }[] =
    LEGACY_POSTS;

  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
    });
    if (dbPosts.length > 0) posts = dbPosts;
  } catch {
    // fallback legado
  }

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Caderno Editorial"
        title="Ideias, mercado e distribuição do livro"
        description="Reflexões e análises da Pro Capital sobre logística editorial, livro escolar e circulação cultural nos países de língua portuguesa."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Blog" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md motion-reduce:transform-none"
            >
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/55">
                  <CalendarDays size={13} className="text-brand" />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>

                <Link href={`/blog/${post.slug}`} className="mt-3 block">
                  <h2 className="font-serif text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
                    {post.title}
                  </h2>
                </Link>

                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 border-t border-line/70 pt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  <span>Ler artigo completo</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
