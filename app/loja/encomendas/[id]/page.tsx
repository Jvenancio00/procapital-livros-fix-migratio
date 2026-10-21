import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { getAllCatalogBooks } from "@/lib/catalog";
import { MARKETS, ORDER_STATUS_LABELS, CLIENT_TYPE_LABELS } from "@/lib/markets";
import OrderActionsClient from "./OrderActionsClient";

export const dynamic = "force-dynamic";

export default async function EncomendaConfirmadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/loja/entrar?callbackUrl=/loja/encomendas/${id}`);
  }

  const [order, catalogBooks] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { items: { include: { book: true } }, user: true },
    }),
    getAllCatalogBooks(),
  ]);

  if (
    !order ||
    (order.user.email.toLowerCase() !== session.user.email.toLowerCase() &&
      session.user.role !== "ADMIN")
  ) {
    notFound();
  }

  const bookMap = new Map(catalogBooks.map((b) => [b.slug, b]));
  const repeatableItems = order.items
    .map((item) => {
      const matched = bookMap.get(item.book.slug);
      return matched ? { book: matched, quantity: item.quantity } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const mDef = MARKETS[order.countryCode] ?? MARKETS.MZ;
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 pb-20 sm:px-8">
      <div className="rounded-3xl border border-line bg-white p-7 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              <CheckCircle2 size={15} />
              <span>Encomenda Comercial Registada</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
              {order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`}
            </h1>
            <p className="mt-1 text-xs text-ink/60">
              Mercado: <strong>{mDef.name}</strong> ({order.currency}) · Perfil:{" "}
              <strong>{CLIENT_TYPE_LABELS[order.clientType]}</strong>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white">
              Estado: {statusLabel}
            </span>
            {order.reservationExpiresAt &&
              ["PENDING", "AWAITING_PAYMENT"].includes(order.status) && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800">
                  <Clock size={13} />
                  Reserva garantida até{" "}
                  {new Date(order.reservationExpiresAt).toLocaleString("pt-PT")}
                </span>
              )}
          </div>
        </div>

        {/* Snapshot dos Itens Encomendados */}
        <div className="mt-6 divide-y divide-line/80">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 py-3.5 text-sm"
            >
              <div>
                <p className="font-serif font-semibold text-ink">
                  {item.quantity}× {item.titleSnapshot || item.book.title}
                </p>
                <p className="text-xs text-ink/55">
                  {item.publisherSnapshot || item.book.editora}
                  {item.isbnSnapshot ? ` · ISBN ${item.isbnSnapshot}` : ""}
                </p>
              </div>
              <span className="font-serif font-semibold text-ink">
                {formatMoney(
                  Number(item.unitPrice) * item.quantity,
                  order.currency,
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Resumo Financeiro Guardado no Snapshot */}
        <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Desconto aplicado</dt>
              <dd>−{formatMoney(Number(order.discountAmount), order.currency)}</dd>
            </div>
          )}
          <div className="flex justify-between text-ink/70">
            <dt>Expedição</dt>
            <dd>
              {Number(order.shippingAmount) === 0
                ? "Grátis"
                : formatMoney(Number(order.shippingAmount), order.currency)}
            </dd>
          </div>
          <div className="flex justify-between text-ink/70">
            <dt>Impostos</dt>
            <dd>{formatMoney(Number(order.taxAmount), order.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 font-serif text-xl font-bold text-ink">
            <dt>Total da Encomenda</dt>
            <dd>{formatMoney(Number(order.totalAmount), order.currency)}</dd>
          </div>
        </dl>

        {/* Instruções Reais de Pagamento Bancário */}
        {order.status === "AWAITING_PAYMENT" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-relaxed text-ink">
            <p className="font-semibold uppercase tracking-wider text-amber-900">
              Instruções de Pagamento Verificado ({mDef.name})
            </p>
            <p className="mt-1.5 text-ink/80">{mDef.defaultBankDetails}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 font-medium text-ink/70">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>
                Indique o código{" "}
                <strong>
                  {order.orderNumber ?? order.id.slice(-8).toUpperCase()}
                </strong>{" "}
                no descritivo da transferência.
              </span>
            </p>
          </div>
        )}

        <OrderActionsClient
          orderId={order.id}
          paymentStatus={order.paymentStatus}
          existingProof={order.paymentReference}
          repeatableItems={repeatableItems}
        />

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-line pt-6">
          <Link
            href="/loja/encomendas"
            className="text-xs font-semibold text-ink/70 hover:text-brand"
          >
            ← Ver histórico completo de encomendas
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            <span>Continuar no catálogo</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
