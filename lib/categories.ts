import { prisma } from "@/lib/prisma";

/**
 * Categorias hierárquicas geridas na base de dados (Prisma), em vez do
 * array fixo `CATEGORIES` que existia em data/books.ts.
 * Corrige a secção "Categorias" do relatório: já não é preciso alterar
 * código/fazer deploy para acrescentar ou reorganizar categorias — basta
 * escrever na tabela Category (ex.: a partir de um futuro painel admin).
 */

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  faq: { pergunta: string; resposta: string }[] | null;
  children: CategoryNode[];
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const byId = new Map<string, CategoryNode>(
    categories.map((c) => [
      c.id,
      {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        faq: (c.faq as { pergunta: string; resposta: string }[] | null) ?? null,
        children: [],
      },
    ])
  );

  const roots: CategoryNode[] = [];
  for (const c of categories) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: true,
      books: {
        include: { prices: true, editoraRef: true },
        take: 60,
      },
    },
  });
}

// Todos os slugs de categoria — usado no sitemap.ts para gerar
// /categoria/[slug] automaticamente (corrige "Problema 4 – SEO perdido").
export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => c.slug);
}
