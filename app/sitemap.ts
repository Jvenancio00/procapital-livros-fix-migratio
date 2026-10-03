import type { MetadataRoute } from "next";
import { BOOKS } from "@/data/books";
import { SITE_URL } from "@/lib/site";
import { getAllCategorySlugs } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

// Só as páginas públicas e indexáveis entram aqui — a área de cliente,
// carrinho e favoritos são específicas de cada utilizador e não devem
// ser indexadas (ver app/robots.ts).
const STATIC_ROUTES = [
  "",
  "/catalogo",
  "/editoras",
  "/sobre",
  "/blog",
  "/contactos",
  "/convenios",
  "/eventos",
  "/livro-digital",
];

// Corrige "Problema 4 – SEO perdido": as páginas de categoria e de
// editora deixam de ter de ser adicionadas à mão aqui — são geradas a
// partir da base de dados, tal como já acontecia com os livros.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const bookEntries: MetadataRoute.Sitemap = BOOKS.map((book) => ({
    url: `${SITE_URL}/livro/${book.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  let categoryEntries: MetadataRoute.Sitemap = [];
  let editoraEntries: MetadataRoute.Sitemap = [];
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const [categorySlugs, editoras, posts] = await Promise.all([
      getAllCategorySlugs(),
      prisma.editora.findMany({ select: { slug: true } }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    categoryEntries = categorySlugs.map((slug) => ({
      url: `${SITE_URL}/categoria/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.65,
    }));

    editoraEntries = editoras.map((e) => ({
      url: `${SITE_URL}/editoras/${e.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    blogEntries = posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch {
    // Sem ligação à base de dados (ex.: build sem DATABASE_URL configurado)
    // — o sitemap continua a funcionar apenas com as rotas estáticas e os
    // livros do ficheiro local, em vez de rebentar o build.
  }

  return [...staticEntries, ...bookEntries, ...categoryEntries, ...editoraEntries, ...blogEntries];
}
