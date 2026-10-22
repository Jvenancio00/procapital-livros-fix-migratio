import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sessão",
  description:
    "Aceda à sua conta de comprador, encomendas, cotações B2B e Biblioteca Digital na Pro Capital.",
  robots: { index: false, follow: true },
};

export default function EntrarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
