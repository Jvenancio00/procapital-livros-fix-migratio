import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo Editorial Multi-Mercado",
  description:
    "Pesquisa avançada por ISBN, título, autor, editora, categoria, nível de ensino e país nos mercados de Angola, Moçambique, Portugal e Brasil.",
  alternates: { canonical: `${SITE_URL}/catalogo` },
  openGraph: {
    title: "Catálogo Editorial Multi-Mercado | Pro Capital",
    description:
      "Consulte disponibilidade por país, preços oficiais em KZ, MT, EUR e R$ e solicite encomenda ou cotação B2B.",
    url: `${SITE_URL}/catalogo`,
    images: [DEFAULT_OG_IMAGE],
  },
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
