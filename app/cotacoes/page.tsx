import { Suspense } from "react";
import { getAllCatalogBooks } from "@/lib/catalog";
import QuoteFormClient from "./QuoteFormClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pedidos de Cotação & Volume B2B | Pro Capital",
  description:
    "Solicite cotação formal, fatura proforma ou reposição por lista ISBN para livrarias, escolas, universidades, empresas e distribuidores.",
};

export default async function CotacoesPage() {
  const books = await getAllCatalogBooks();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 py-16 text-sm text-ink/60">
          A carregar formulário de cotação comercial...
        </div>
      }
    >
      <QuoteFormClient books={books} />
    </Suspense>
  );
}
