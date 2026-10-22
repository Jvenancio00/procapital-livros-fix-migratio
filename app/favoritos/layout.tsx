import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lista de Favoritos",
  description:
    "Títulos escolares, literários e técnicos guardados na sua lista de favoritos na Pro Capital.",
  robots: { index: false, follow: false },
};

export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
