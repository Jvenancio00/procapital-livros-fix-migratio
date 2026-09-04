import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Corrige a duplicação de rota que existia entre esta página dinâmica e
// app/blog/distribuidora-de-livros-elo-essencial/page.tsx (uma página
// "dentro" de outra área já coberta por esta rota, ambas capazes de
// responder pelo mesmo URL). Em vez de manter as duas, o artigo antigo
// passou a viver aqui como conteúdo de reserva (LEGACY_CONTENT), usado
// apenas se a base de dados ainda não tiver sido semeada.
interface Props {
  params: Promise<{ slug: string }>;
}

const LEGACY_CONTENT: Record<
  string,
  { title: string; publishedAt: string; readTime: string; body: string[] }
> = {
  "distribuidora-de-livros-elo-essencial": {
    title: "Distribuidora de livros: o elo essencial entre autores, editoras e livrarias",
    publishedAt: "13 de julho de 2026",
    readTime: "4 min de leitura",
    body: [
      "Entre quem escreve um livro e quem o lê existe uma cadeia de trabalho pouco visível, mas decisiva: a distribuição. Uma distribuidora de livros é a empresa que garante que um título chega das editoras às livrarias, às escolas e, por fim, às mãos do leitor — em tempo útil e com previsibilidade.",
      "Na prática, uma distribuidora compra ou recebe em consignação grandes volumes de livros junto das editoras e organiza a sua venda a livrarias, escolas e outros pontos de venda: gestão de stock, logística de entrega, negociação comercial e promoção de catálogo.",
      "Para as editoras, significa alcançar mais pontos de venda sem multiplicar negociações. Para livrarias e escolas, significa um único interlocutor para um catálogo diversificado. Para os autores, significa maior exposição e uma chegada mais rápida das suas obras ao público.",
      "É exatamente este o compromisso da Pro Capital em Moçambique: ligar editoras, livrarias, escolas e leitores com um catálogo diversificado e um serviço próximo.",
    ],
  },
};

async function getPost(slug: string) {
  try {
    return await prisma.blogPost.findUnique({ where: { slug, published: true } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (post) return { title: `${post.title} | Blog Pro Capital`, description: post.excerpt };

  const legacy = LEGACY_CONTENT[slug];
  if (legacy) return { title: `${legacy.title} | Pro Capital` };

  return {};
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (post) {
    return (
      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-ink">
          <ArrowLeft size={15} /> Voltar ao blog
        </Link>
        <p className="mt-6 text-xs uppercase tracking-wide text-foreground/45">
          {new Date(post.publishedAt).toLocaleDateString("pt-PT")}
          {post.authorName ? ` · ${post.authorName}` : ""}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">{post.title}</h1>
        <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-foreground/80">
          {post.content}
        </div>
      </article>
    );
  }

  // Sem ligação à base de dados (ou ainda não semeada) — usa o conteúdo
  // legado, só para o artigo que já existia como página estática.
  const legacy = LEGACY_CONTENT[slug];
  if (!legacy) notFound();

  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-ink">
            <ArrowLeft size={15} /> Voltar ao blog
          </Link>
          <div className="mt-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-foreground/50">
            <span>{legacy.publishedAt}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {legacy.readTime}
            </span>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {legacy.title}
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="space-y-6 text-base leading-relaxed text-foreground/80">
          {legacy.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-line bg-cream-deep/50 p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg font-semibold text-ink">
            Quer distribuir ou revender connosco?
          </p>
          <Link
            href="/contactos"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark"
          >
            Fale connosco
            <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    </div>
  );
}
