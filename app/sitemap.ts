import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";
import { getAllCategorySlugs } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

const STATIC_ROUTES = [
  "",
  "/livros-escolares",
  "/catalogo",
  "/editoras",
  "/destaques",
  "/mais-vendidos",
  "/cotacoes",
  "/convenios",
  "/sobre",
  "/blog",
  "/eventos",
  "/livro-digital",
  "/contactos",
  "/privacidade",
];

const FALLBACK_CATEGORY_SLUGS = ["escolar", "ficcao", "infantil", "nao-ficcao"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority:
      route === ""
        ? 1
        : route === "/livros-escolares" || route === "/catalogo"
        ? 0.9
        : 0.75,
  }));

  const [books, publishers] = await Promise.all([
    getAllCatalogBooks(),
    getAllPublishers(),
  ]);

  const bookEntries: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${SITE_URL}/livro/${book.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const editoraEntries: MetadataRoute.Sitemap = publishers.map((editora) => ({
    url: `${SITE_URL}/editoras/${editora.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  let categorySlugs = FALLBACK_CATEGORY_SLUGS;
  let blogSlugs: { slug: string; updatedAt: Date }[] = [
    { slug: "distribuidora-de-livros-elo-essencial", updatedAt: now },
  ];
  let eventSlugs: { slug: string; updatedAt: Date }[] = [];

  try {
    const [dbCategorySlugs, posts, eventos] = await Promise.all([
      getAllCategorySlugs(),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.evento.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    if (dbCategorySlugs.length > 0) categorySlugs = dbCategorySlugs;
    if (posts.length > 0) blogSlugs = posts;
    eventSlugs = eventos;
  } catch {
    // Fallback resiliente quando executado sem ligação ativa à base de dados
  }

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/categoria/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const eventEntries: MetadataRoute.Sitemap = eventSlugs.map((ev) => ({
    url: `${SITE_URL}/eventos/${ev.slug}`,
    lastModified: ev.updatedAt,
    changeFrequency: "weekly",
    priority: 0.55,
  }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...editoraEntries,
    ...bookEntries,
    ...blogEntries,
    ...eventEntries,
  ];
}
