import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificação de Email",
  description:
    "Confirmação de endereço de correio eletrónico da conta Pro Capital.",
  robots: { index: false, follow: false },
};

export default function VerificarEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
