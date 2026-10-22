import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Comercial B2B",
  description:
    "Catálogo comercial rápido, reposição de stock e encomendas em volume para livrarias, escolas e parceiros B2B da Pro Capital.",
  robots: { index: false, follow: false },
};

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
