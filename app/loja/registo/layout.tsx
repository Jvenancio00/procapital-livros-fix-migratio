import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar Conta",
  description:
    "Registe-se na Pro Capital como leitor particular, escola, livraria, editora ou instituição para encomendas, cotações B2B e Biblioteca Digital.",
  robots: { index: false, follow: true },
};

export default function RegistoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
