import { Suspense } from "react";
import { getAllCatalogBooks, getAllPublishers } from "@/lib/catalog";
import SchoolCatalogClient from "./SchoolCatalogClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Livros Escolares & Académicos | Pro Capital",
  description:
    "Catálogo prioritário de livros escolares, manuais curriculares, gramáticas e obras académicas filtráveis por país, nível de ensino, classe, disciplina e editora.",
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
