import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  FileSpreadsheet,
  Lock,
  Package,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import { formatMoney } from "@/lib/currency";
import { ORDER_STATUS_LABELS, QUOTE_STATUS_LABELS } from "@/lib/markets";
import SignOutButton from "@/components/SignOutButton";
import ProfileFormClient from "./ProfileFormClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A Minha Conta & Perfil Comercial",
  description:
    "Gira os dados fiscais da sua conta Pro Capital, encomendas recentes, cotações B2B e Biblioteca Digital.",
  robots: { index: false, follow: false },
};

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/loja/entrar?callbackUrl=/loja/conta");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      clientProfile: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { items: true },
      },
      quoteRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/loja/entrar");

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Área de Cliente & Comprador B2B"
        title={`Olá, ${user.name ?? user.email}`}
        description="Gira o seu perfil comprador (Particular, Livraria, Escola, Editora, Empresa ou Distribuidor), acompanhe encomendas, repita pedidos e consulte cotações."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Minha Conta" },
        ]}
        actions={
          <>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-ink/90"
              >
                <ShieldCheck size={14} className="text-accent" />
                <span>Painel Administrativo</span>
              </Link>
            )}
            <SignOutButton />
          </>
        }
      />

      <section className="mx-auto max-w-7xl space-y-8 px-5 sm:px-8">
        {/* Atalhos Rápidos da Conta */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/loja/encomendas"
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand/40"
          >
            <Package size={20} className="text-brand" />
            <div>
              <p className="font-serif text-base font-semibold text-ink">
                Encomendas ({user.orders.length})
              </p>
              <p className="text-xs text-ink/60">Estados, faturas e repetição</p>
            </div>
          </Link>

          <Link
            href="/loja/biblioteca"
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand/40"
          >
            <BookOpen size={20} className="text-brand" />
            <div>
              <p className="font-serif text-base font-semibold text-ink">
                Biblioteca Digital
              </p>
              <p className="text-xs text-ink/60">Leitura online e marcadores</p>
            </div>
          </Link>

          <Link
            href="/cotacoes"
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand/40"
          >
            <FileSpreadsheet size={20} className="text-brand" />
            <div>
              <p className="font-serif text-base font-semibold text-ink">
                Pedidos de Cotação
              </p>
              <p className="text-xs text-ink/60">Propostas escolares e B2B</p>
            </div>
          </Link>

          <Link
            href="/loja/seguranca"
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand/40"
          >
            <Lock size={20} className="text-brand" />
            <div>
              <p className="font-serif text-base font-semibold text-ink">
                Segurança &amp; 2FA
              </p>
              <p className="text-xs text-ink/60">Autenticação em 2 fatores</p>
            </div>
          </Link>
        </div>

        <ProfileFormClient
          initialProfile={{
            type: user.clientProfile?.type ?? "PARTICULAR",
            companyName: user.clientProfile?.companyName ?? "",
            taxId: user.clientProfile?.taxId ?? "",
            countryCode: user.clientProfile?.countryCode ?? "MZ",
            phone: user.clientProfile?.phone ?? "",
            city: user.clientProfile?.city ?? "",
            billingAddress: user.clientProfile?.billingAddress ?? "",
            approvedB2B: user.clientProfile?.approvedB2B ?? false,
            discountPercent: user.clientProfile?.discountPercent ?? 0,
          }}
        />

        {/* Últimas Encomendas e Cotações */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-ink">
                Encomendas Recentes
              </h2>
              <Link
                href="/loja/encomendas"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Ver todas →
              </Link>
            </div>

            {user.orders.length === 0 ? (
              <p className="mt-4 text-xs text-ink/60">
                Ainda não registou encomendas nesta conta.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-line/70">
                {user.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/loja/encomendas/${o.id}`}
                    className="flex items-center justify-between py-3 text-xs hover:text-brand"
                  >
                    <div>
                      <p className="font-semibold text-ink">
                        {o.orderNumber ?? `#${o.id.slice(-8).toUpperCase()}`}
                      </p>
                      <p className="text-ink/55">
                        {o.items.length} item(ns) ·{" "}
                        {ORDER_STATUS_LABELS[o.status] ?? o.status}
                      </p>
                    </div>
                    <span className="font-serif text-sm font-bold text-ink">
                      {formatMoney(Number(o.totalAmount), o.currency)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-ink">
                Pedidos de Cotação B2B
              </h2>
              <Link
                href="/cotacoes"
                className="text-xs font-semibold text-brand hover:underline"
              >
                Novo pedido →
              </Link>
            </div>

            {user.quoteRequests.length === 0 ? (
              <p className="mt-4 text-xs text-ink/60">
                Nenhum pedido de cotação submetido com este email.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-line/70">
                {user.quoteRequests.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-ink">{q.quoteNumber}</p>
                      <p className="text-ink/55">
                        {q.organizationName ?? q.contactName}
                      </p>
                    </div>
                    <span className="rounded-full bg-cream-deep px-3 py-1 font-semibold text-ink">
                      {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
