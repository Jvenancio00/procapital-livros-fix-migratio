import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Palavra-Passe",
  description:
    "Solicite um link seguro para redefinir a palavra-passe da sua conta na Pro Capital.",
  robots: { index: false, follow: false },
};

export default function RecuperarSenhaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
