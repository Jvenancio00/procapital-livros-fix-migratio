import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  FileDown,
  FileSpreadsheet,
  PackageOpen,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import {
  MARKETS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
} from "@/lib/markets";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Encomendas e Cotações",
  description:
    "Acompanhe o estado das suas encomendas, submeta comprovativos bancários, descarregue faturas proforma em PDF e consulte propostas de cotação na Pro Capital.",
  robots: { index: false, follow: false },
};

export default async function MinhasEncomendasPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/loja/entrar?callbackUrl=/loja/encomendas");
  }

  const email = session.user.email;

  const [user, quotes] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: true },
        },
      },
    }),
    prisma.quoteRequest.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  const orders = user?.orders ?? [];

  return (
    <main>
      <PageHeader
        eyebrow="Área Comercial & Cliente"
        title="Encomendas e Cotações"
        description="Acompanhe em tempo real o estado das suas encomendas, submeta comprovativos bancários, descarregue faturas proforma em PDF e consulte propostas de cotação."
      />

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
            Encomendas Registadas ({orders.length})
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/cotacoes"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:border-brand/40"
            >
              <FileSpreadsheet size={14} />
              <span>Solicitar cotação B2B</span>
            </Link>
            <Link
              href="/loja/conta"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:border-brand/40"
            >
              <span>Perfil fiscal &amp; conta</span>
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-white p-10 text-center">
            <PackageOpen size={32} className="mx-auto text-ink/30" />
            <p className="mt-4 text-sm text-ink/65">
              Ainda não tem encomendas registadas nesta conta.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <span>Explorar catálogo</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((order) => {
              const code =
                order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`;
              const marketName =
                MARKETS[order.countryCode]?.name ?? order.countryCode;
              const totalUnits = order.items.reduce(
                (sum, i) => sum + i.quantity,
                0,
              );

              return (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/25"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/loja/encomendas/${order.id}`}
                        className="font-mono text-sm font-bold text-ink hover:text-brand"
                      >
                        {code}
                      </Link>
                      <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[11px] font-medium text-ink/75">
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] ??
                          order.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-ink/60">
                      {totalUnits} exemplar(es) ({order.items.length} título
                      {order.items.length === 1 ? "" : "s"}) · Mercado:{" "}
                      <strong>{marketName}</strong> ({order.currency}) ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-serif text-base font-bold text-ink">
                      {formatMoney(Number(order.totalAmount), order.currency)}
                    </p>
                    <a
                      href={`/api/encomendas/${order.id}/documento`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/60 px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-brand/40"
                    >
                      <FileDown size={13} />
                      <span>PDF</span>
                    </a>
                    <Link
                      href={`/loja/encomendas/${order.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                    >
                      <span>Ver detalhes</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pedidos de Cotação B2B */}
        <section className="mt-14 border-t border-line pt-10">
          <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
            Pedidos de Cotação B2B ({quotes.length})
          </h2>
          {quotes.length === 0 ? (
            <p className="mt-3 text-xs text-ink/60">
              Não existem pedidos de cotação associados ao email {email}. Para
              encomendas escolares ou institucionais em quantidade, utilize a{" "}
              <Link href="/cotacoes" className="font-semibold text-brand underline">
                Central de Cotações
              </Link>
              .
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-ink">
                        {q.quoteNumber}
                      </span>
                      <span className="rounded-full bg-cream-deep px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                        {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink/60">
                      {q.organizationName ?? q.contactName} ·{" "}
                      {MARKETS[q.countryCode]?.name ?? q.countryCode} ·{" "}
                      {q.items.reduce((s, i) => s + i.quantity, 0)} exemplares ·{" "}
                      {new Date(q.createdAt).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    {q.quotedTotal ? (
                      <p className="font-serif text-sm font-bold text-brand">
                        Proposta:{" "}
                        {formatMoney(Number(q.quotedTotal), q.currency)}
                      </p>
                    ) : q.estimatedTotal ? (
                      <p className="font-semibold text-ink/75">
                        Estimado:{" "}
                        {formatMoney(Number(q.estimatedTotal), q.currency)}
                      </p>
                    ) : (
                      <span className="text-ink/55">Em análise comercial</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
