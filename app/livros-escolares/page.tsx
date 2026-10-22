import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import SchoolCatalogClient from "./SchoolCatalogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Livros Escolares & Académicos",
  description:
    "Catálogo prioritário de livros escolares, manuais curriculares, gramáticas e obras académicas filtráveis por país, nível de ensino, classe, disciplina e editora.",
  alternates: { canonical: `${SITE_URL}/livros-escolares` },
  openGraph: {
    title: "Livros Escolares & Académicos (1.ª à 12.ª Classe e Superior) | Pro Capital",
    description:
      "Manuais escolares, cadernos de atividades e obras académicas com encomenda direta ou cotação escolar por volume.",
    url: `${SITE_URL}/livros-escolares`,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function SchoolBooksPage() {
  const [dbBooks, publishers] = await Promise.all([
    getAllCatalogBooks(),
    getAllPublishers(),
  ]);

  const schoolBooks = dbBooks.filter(
    (b) => b.category === "Escolar" || Boolean(b.educationLevel),
  );

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 py-16 text-sm text-ink/60">
          A carregar catálogo escolar...
        </div>
      }
    >
      <SchoolCatalogClient
        books={schoolBooks}
        publishers={publishers.map((e) => ({ slug: e.slug, name: e.name }))}
      />
    </Suspense>
  );
}
