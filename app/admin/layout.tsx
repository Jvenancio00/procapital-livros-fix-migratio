import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Centro Administrativo",
  description:
    "Gestão editorial, preços multi-mercado, stock, importações Excel/CSV, encomendas e cotações B2B da Pro Capital.",
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { href: "/admin", label: "Painel & Relatórios" },
  { href: "/admin/livros", label: "Livros & Capas" },
  { href: "/admin/editoras", label: "Editoras" },
  { href: "/admin/mercados", label: "Mercados & Moedas" },
  { href: "/admin/stock", label: "Stock & Armazéns" },
  { href: "/admin/importacoes", label: "Importar Excel/CSV" },
  { href: "/admin/encomendas", label: "Encomendas & Pagamentos" },
  { href: "/admin/cotacoes", label: "Cotações B2B" },
  { href: "/admin/catalogos", label: "Catálogos PDF" },
  { href: "/admin/utilizadores", label: "Utilizadores & Perfis" },
  { href: "/admin/convenios", label: "Convénios" },
  { href: "/admin/notificacoes", label: "Emails & Auditoria" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/loja/entrar?callbackUrl=/admin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <div className="rounded-3xl border border-line bg-white p-10">
          <ShieldAlert size={40} className="mx-auto text-brand" />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">
            Acesso Restrito à Administração
          </h1>
          <p className="mt-2 text-sm text-ink/65">
            A sua conta (<strong>{session.user.email}</strong>) não possui
            permissões administrativas para aceder a este painel.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/loja/conta"
              className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white"
            >
              Ir para a Minha Conta
            </Link>
            <Link
              href="/"
              className="rounded-full border border-line px-6 py-2.5 text-xs font-semibold text-ink"
            >
              Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-3.5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              <ShieldCheck size={16} className="text-brand" />
              <span>Centro Administrativo Pro Capital</span>
              <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[10px] text-ink/70">
                {dbUser.email}
              </span>
            </div>

            <Link
              href="/"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Ver loja pública →
            </Link>
          </div>

          <nav
            aria-label="Módulos administrativos"
            className="mt-3 flex gap-1.5 overflow-x-auto pb-1 text-xs"
          >
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-line/80 bg-cream/60 px-3.5 py-1.5 font-semibold text-ink/80 transition-colors hover:border-brand/50 hover:bg-white hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">{children}</div>
    </div>
  );
}
