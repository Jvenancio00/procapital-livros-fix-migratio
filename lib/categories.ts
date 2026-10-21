import { BOOKS } from "@/data/books";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  faq: { pergunta: string; resposta: string }[] | null;
  children: CategoryNode[];
}

const FALLBACK_CATEGORIES: Array<{
  slug: string;
  name: string;
  description: string;
}> = [
  {
    slug: "escolar",
    name: "Escolar",
    description:
      "Manuais escolares e cadernos de atividades alinhados aos currículos nacionais, do ensino primário ao superior.",
  },
  {
    slug: "ficcao",
    name: "Ficção",
    description:
      "Romance, conto, crónica e poesia de autores de Angola, Moçambique, Portugal e Brasil.",
  },
  {
    slug: "infantil",
    name: "Infantil",
    description:
      "Obras ilustradas e literatura infantojuvenil de autores lusófonos.",
  },
  {
    slug: "nao-ficcao",
    name: "Não-ficção",
    description: "Ensaio, pedagogia, história, biografia e obras de referência.",
  },
];

export async function getCategoryTree(): Promise<CategoryNode[]> {
  if (!isDatabaseConfigured()) {
    return FALLBACK_CATEGORIES.map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      description: c.description,
      faq: null,
      children: [],
    }));
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    if (categories.length === 0) {
      return FALLBACK_CATEGORIES.map((c) => ({
        id: c.slug,
        slug: c.slug,
        name: c.name,
        description: c.description,
        faq: null,
        children: [],
      }));
    }

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
      ]),
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
  } catch {
    return FALLBACK_CATEGORIES.map((c) => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      description: c.description,
      faq: null,
      children: [],
    }));
  }
}

export async function getCategoryBySlug(slug: string) {
  if (isDatabaseConfigured()) {
    try {
      const found = await prisma.category.findUnique({
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
      if (found) return found;
    } catch {
      // Fallback para dados estáticos caso a BD não esteja disponível
    }
  }

  const fb = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
  if (!fb) return null;

  const matchingBooks = BOOKS.filter((b) => b.category === fb.name);
  return {
    id: fb.slug,
    slug: fb.slug,
    name: fb.name,
    description: fb.description,
    faq: null,
    parentId: null,
    parent: null,
    children: [],
    books: matchingBooks.map((b) => ({
      id: b.slug,
      slug: b.slug,
      title: b.title,
      author: b.author,
      editora: b.editora,
      description: b.description ?? null,
      isbn: b.isbn ?? null,
      coverUrl: b.coverUrl ?? null,
      pdfUrl: b.downloadUrl ?? null,
      pages: b.pages ?? null,
      year: b.year ?? null,
      free: Boolean(b.free),
      featured: Boolean(b.featured),
      featuredFrom: null,
      featuredTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryId: fb.slug,
      editoraId: null,
      prices: [
        { id: `${b.slug}-mt`, bookId: b.slug, currency: "MT" as const, amount: b.price },
        { id: `${b.slug}-kz`, bookId: b.slug, currency: "KZ" as const, amount: b.priceKZ },
        { id: `${b.slug}-eur`, bookId: b.slug, currency: "EUR" as const, amount: b.priceEUR },
        { id: `${b.slug}-brl`, bookId: b.slug, currency: "BRL" as const, amount: b.priceBRL },
      ],
      editoraRef: null,
    })),
  };
}

export async function getAllCategorySlugs(): Promise<string[]> {
  if (!isDatabaseConfigured()) {
    return FALLBACK_CATEGORIES.map((c) => c.slug);
  }
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    return categories.map((c) => c.slug);
  } catch {
    return FALLBACK_CATEGORIES.map((c) => c.slug);
  }
}
