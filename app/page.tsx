import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { BOOKS } from "@/data/books";
import { getFeaturedBooks } from "@/lib/featured";
import { getBestsellers } from "@/lib/bestsellers";

// Corrige em parte o "Problema de SEO" da Página Inicial: antes era
// inteiramente "use client" e por isso não conseguia ter metadata própria
// (o Next.js não permite `export const metadata` em ficheiros "use
// client"). Este ficheiro passa a ser um server component com metadata
// específica; a interatividade (idioma, animações) continua no
// HomeClient. As listas de destaques/mais vendidos tentam primeiro vir da
// base de dados (regras reais) e caem para os campos estáticos
// featured/bestseller se a BD ainda não estiver ligada.
export const metadata: Metadata = {
  title: "Pro Capital | Distribuidora de Livros em Moçambique e na CPLP",
  description:
    "Catálogo de livros escolares, literatura e infantil, com entrega em Moçambique e distribuição em Angola, Portugal, Brasil e países da CPLP.",
};

export default async function Page() {
  let featuredBooks = BOOKS.filter((book) => book.featured);
  let bestsellerBooks = BOOKS.filter((book) => book.bestseller);

  try {
    const [featured, bestsellers] = await Promise.all([
      getFeaturedBooks(4),
      getBestsellers({ range: "30d", limit: 4 }),
    ]);
    if (featured.length > 0) {
      const bySlug = new Map(BOOKS.map((b) => [b.slug, b]));
      const mapped = featured.map((f) => bySlug.get(f.slug)).filter(Boolean);
      if (mapped.length > 0) featuredBooks = mapped as typeof BOOKS;
    }
    if (bestsellers.length > 0) {
      const bySlug = new Map(BOOKS.map((b) => [b.slug, b]));
      const mapped = bestsellers.map((b) => bySlug.get(b.slug)).filter(Boolean);
      if (mapped.length > 0) bestsellerBooks = mapped as typeof BOOKS;
    }
  } catch {
    // Sem ligação à base de dados — mantém os campos estáticos como
    // fallback, em vez de rebentar a renderização da homepage.
  }

  return <HomeClient featuredBooks={featuredBooks} bestsellerBooks={bestsellerBooks} />;
}
