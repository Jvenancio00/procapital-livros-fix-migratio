import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir Palavra-Passe",
  description:
    "Defina uma nova palavra-passe segura para a sua conta na Pro Capital.",
  robots: { index: false, follow: false },
};

export default function RedefinirSenhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
