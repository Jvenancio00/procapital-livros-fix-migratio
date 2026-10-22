import type { Metadata } from "next";
import CarrinhoPage from "@/app/carrinho/page";

export const metadata: Metadata = {
  title: "Checkout Comercial",
  description:
    "Conclua a sua encomenda de livros ou solicite fatura proforma comercial por mercado na Pro Capital.",
  robots: { index: false, follow: false },
};

export default function CheckoutAliasPage() {
  return <CarrinhoPage />;
}
