import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrinho Comercial",
  description:
    "Reveja os livros selecionados, calcule expedição e finalize a sua encomenda ou pedido de fatura proforma na Pro Capital.",
  robots: { index: false, follow: false },
};

export default function CarrinhoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
