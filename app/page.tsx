import HomeClient from "./HomeClient";
import { prisma } from "@/lib/prisma";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allViews, publishers, dbCategorias, dbEventos, dbBlogPosts] =
    await Promise.all([
      getAllCatalogBooks(),
      getAllPublishers(),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.evento.findMany({
        orderBy: { dataInicio: "asc" },
        take: 4,
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    ]);

  const featuredBooks = allViews.filter((b) => b.featured);
  const bestsellerBooks = allViews.filter((b) => b.bestseller);
  const schoolBooks = allViews.filter(
    (b) => b.category === "Escolar" || Boolean(b.educationLevel),
  );

  const mainCategorySlugs = [
    {
      name: "Escolar",
      slug: "escolar",
      description: "Manuais, gramáticas, cadernos de exercícios e obras curriculares.",
    },
    {
      name: "Infantil",
      slug: "infantil",
      description: "Primeiras leituras, contos ilustrados e literatura infantojuvenil.",
    },
    {
      name: "Ficção",
      slug: "ficcao",
      description: "Romances, contos e poesia de autores africanos e lusófonos.",
    },
    {
      name: "Não-ficção",
      slug: "nao-ficcao",
      description: "Economia, história, direito, gestão e pensamento contemporâneo.",
    },
  ];

  const categories = mainCategorySlugs.map((cat) => {
    const dbCat = dbCategorias.find((c) => c.slug === cat.slug);
    const count = allViews.filter((b) => b.category === cat.name).length;
    return {
      name: dbCat?.name ?? cat.name,
      slug: cat.slug,
      description: dbCat?.description ?? cat.description,
      count,
    };
  });

  const events = dbEventos.map((ev) => ({
    slug: ev.slug,
    title: ev.titulo,
    description: ev.descricao,
    location: ev.local,
    startDate: ev.dataInicio.toISOString(),
    featured: true,
  }));

  const posts = dbBlogPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    summary: post.excerpt,
    author: post.authorName ?? "Redação Pro Capital",
    category: "Editorial & Mercado",
    readingTime: Math.max(2, Math.round(post.content.split(/\s+/).length / 180)),
    createdAt: post.publishedAt.toISOString(),
  }));

  return (
    <HomeClient
      stats={{
        totalBooks: allViews.length,
        totalPublishers: publishers.length,
        schoolBooks: schoolBooks.length,
        activeMarkets: 4,
      }}
      featuredBooks={featuredBooks.length > 0 ? featuredBooks : allViews.slice(0, 8)}
      bestsellerBooks={
        bestsellerBooks.length > 0 ? bestsellerBooks : allViews.slice(0, 8)
      }
      schoolBooks={schoolBooks}
      categories={categories}
      publishers={publishers}
      events={events}
      posts={posts}
    />
  );
}
