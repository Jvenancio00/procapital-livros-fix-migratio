import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllCatalogBooks } from "@/lib/catalog";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import QuoteFormClient from "./QuoteFormClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedidos de Cotação & Volume B2B",
  description:
    "Solicite cotação formal, fatura proforma ou reposição por lista ISBN para livrarias, escolas, universidades, empresas e distribuidores.",
  alternates: { canonical: `${SITE_URL}/cotacoes` },
  openGraph: {
    title: "Pedidos de Cotação & Volume B2B | Pro Capital",
    description:
      "Receba proposta comercial por volume em até 24 horas úteis para escolas, livrarias e instituições na CPLP.",
    url: `${SITE_URL}/cotacoes`,
    images: [DEFAULT_OG_IMAGE],
  },
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
