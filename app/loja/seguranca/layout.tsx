import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Segurança & Autenticação 2FA",
  description:
    "Configure autenticação de dois fatores (TOTP) e consulte o histórico de acessos da sua conta Pro Capital.",
  robots: { index: false, follow: false },
};

export default function SegurancaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
