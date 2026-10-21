import { Suspense } from "react";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo Editorial Multi-Mercado | Pro Capital",
  description:
    "Pesquisa avançada por ISBN, título, autor, editora, categoria, nível de ensino e país nos mercados de Angola, Moçambique, Portugal e Brasil.",
};

export default async function CatalogPage() {
  const [books, publishers] = await Promise.all([
    getAllCatalogBooks(),
    getAllPublishers(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 py-16 text-sm text-ink/60">
          A carregar catálogo editorial...
        </div>
      }
    >
      <CatalogClient
        books={books}
        publishers={publishers.map((e) => ({ slug: e.slug, name: e.name }))}
      />
    </Suspense>
  );
}
