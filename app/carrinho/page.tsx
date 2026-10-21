"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatMoney, getPriceInCurrency } from "@/lib/currency";
import { quantityDiscountRate, crossSellSuggestions } from "@/lib/cart-pricing";
import BookCover from "@/components/BookCover";
import BookCard from "@/components/BookCard";
import PageHeader from "@/components/PageHeader";
import { CLIENT_TYPE_LABELS, MARKET_LIST, MARKETS } from "@/lib/markets";
import type { ClientType, MarketCode } from "@/lib/enums";

export default function CarrinhoPage() {
  const { items, setQuantity, removeItem, clear } = useCart();
  const { currency, market, setMarket } = useCurrency();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clientType, setClientType] = useState<ClientType>("PARTICULAR");
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [invoiceRequested, setInvoiceRequested] = useState(true);
  const [notes, setNotes] = useState("");
  const [b2bDiscountPercent, setB2bDiscountPercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name && !customerName) {
      setCustomerName(session.user.name);
    }
    if (status === "authenticated") {
      fetch("/api/cliente/perfil")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const p = data?.profile;
          if (!p) return;
          if (p.type) setClientType(p.type);
          if (p.companyName) setCompanyName(p.companyName);
          if (p.taxId) setCustomerTaxId(p.taxId);
          if (p.phone) setCustomerPhone(p.phone);
          if (p.city) setShippingCity(p.city);
          if (p.billingAddress) setShippingAddress(p.billingAddress);
          if (p.approvedB2B && p.discountPercent > 0) {
            setB2bDiscountPercent(p.discountPercent);
          }
        })
        .catch(() => {});
    }
  }, [session, status, customerName]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <div className="rounded-3xl border border-line bg-white p-12">
          <h1 className="font-serif text-3xl font-semibold text-ink">
            O seu carrinho comercial está vazio
          </h1>
          <p className="mt-3 text-sm text-ink/65">
            Explore o catálogo multi-mercado, a área prioritária de livros escolares
            ou repita uma encomenda anterior na sua conta.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <span>Explorar catálogo</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/livros-escolares"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-xs font-semibold text-ink hover:border-ink/40"
            >
              <span>Livros Escolares</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mDef = MARKETS[market];
  const adminRate = b2bDiscountPercent / 100;

  const subtotalGross = items.reduce(
    (sum, item) => sum + getPriceInCurrency(item.book, currency) * item.quantity,
    0,
  );
  const discountTotal = items.reduce((sum, item) => {
    const rate = Math.max(adminRate, quantityDiscountRate(item.quantity));
    return sum + getPriceInCurrency(item.book, currency) * item.quantity * rate;
  }, 0);
  const netBeforeTax = Math.max(0, subtotalGross - discountTotal);
  const shippingFee =
    netBeforeTax >= mDef.defaultFreeShippingThreshold ? 0 : mDef.defaultShippingFlatFee;
  const taxAmount = (netBeforeTax * mDef.defaultTaxRatePercent) / 100;
  const grandTotal = netBeforeTax + taxAmount + shippingFee;

  const sugestoes = crossSellSuggestions(items);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (status !== "authenticated") {
      router.push("/loja/entrar?callbackUrl=/carrinho");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: market,
          currency,
          clientType,
          customerName,
          companyName,
          customerTaxId,
          customerPhone,
          shippingCity: shippingCity || mDef.capitalHub,
          shippingAddress,
          paymentMethod,
          invoiceRequested,
          notes,
          items: items.map((item) => ({
            slug: item.book.slug,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Não foi possível finalizar a encomenda.");
        setSubmitting(false);
        return;
      }

      clear();
      router.push(`/loja/encomendas/${data.id}`);
    } catch {
      setError("Ocorreu um erro de ligação. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Carrinho & Checkout Multi-Mercado"
        title="Finalizar Encomenda Comercial"
        description="Reveja quantidades, perfil comprador, país/moeda oficial, dados fiscais, cálculo de portes e método de pagamento."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Carrinho & Checkout" },
        ]}
        actions={
          <Link
            href={`/cotacoes?pais=${market}`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand"
          >
            <FileSpreadsheet size={14} />
            <span>Converter em Pedido de Cotação</span>
          </Link>
        }
      />

      <form
        onSubmit={handleCheckout}
        className="mx-auto max-w-7xl px-5 sm:px-8"
      >
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Coluna Esquerda: Etapas 1 a 7 do Checkout */}
          <div className="space-y-6 lg:col-span-7">
            {/* Etapa 1: Revisão do Carrinho */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-serif text-xl font-semibold text-ink">
                1. Revisão dos Títulos Selecionados ({items.length})
              </h2>

              <div className="mt-4 divide-y divide-line/80">
                {items.map(({ book, quantity }) => {
                  const unit = getPriceInCurrency(book, currency);
                  const rate = Math.max(adminRate, quantityDiscountRate(quantity));
                  return (
                    <div
                      key={book.slug}
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 shrink-0">
                          <BookCover
                            book={book}
                            showCategory={false}
                            sizes="64px"
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/livro/${book.slug}`}
                            className="font-serif text-base font-semibold text-ink hover:text-brand"
                          >
                            {book.title}
                          </Link>
                          <p className="text-xs text-ink/60">
                            {book.editora}
                            {book.isbn ? ` · ISBN ${book.isbn}` : ""}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-ink">
                            {formatMoney(unit, currency)} / un.
                            {rate > 0 && (
                              <span className="ml-2 text-emerald-700">
                                (−{Math.round(rate * 100)}% desconto comercial)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            onClick={() => setQuantity(book.slug, quantity - 1)}
                            aria-label="Diminuir"
                            className="p-2 text-ink"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="min-w-8 text-center text-xs font-semibold">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(book.slug, quantity + 1)}
                            aria-label="Aumentar"
                            className="p-2 text-ink"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(book.slug)}
                          aria-label="Remover item"
                          className="p-2 text-ink/45 hover:text-brand"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Etapas 2, 3 e 4: Perfil, País/Moeda e Dados de Faturação/Entrega */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-brand" />
                <h2 className="font-serif text-xl font-semibold text-ink">
                  2. Perfil Comprador, País/Moeda e Faturação
                </h2>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-ink/75">
                    Perfil de Comprador
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as ClientType)}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs font-semibold text-ink"
                  >
                    {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((t) => (
                      <option key={t} value={t}>
                        {CLIENT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/75">
                    País &amp; Moeda Comercial Oficial
                  </label>
                  <select
                    value={market}
                    onChange={(e) => setMarket(e.target.value as MarketCode)}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs font-semibold text-ink"
                  >
                    {MARKET_LIST.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name} — {m.currency} ({m.isoCurrency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/75">
                    Nome do Destinatário / Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome completo"
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/75">
                    Telefone de Contacto na Entrega
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+258 / +244 / +351 / +55"
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
                  />
                </div>

                {clientType !== "PARTICULAR" && (
                  <div>
                    <label className="block text-xs font-semibold text-ink/75">
                      Livraria / Escola / Instituição
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nome oficial da entidade"
                      className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-ink/75">
                    Identificação Fiscal ({mDef.taxIdLabel})
                  </label>
                  <input
                    type="text"
                    value={customerTaxId}
                    onChange={(e) => setCustomerTaxId(e.target.value)}
                    placeholder={mDef.taxIdLabel}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/75">
                    Cidade / Província ({mDef.name})
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder={mDef.capitalHub}
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/75">
                    Morada de Entrega *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Rua, avenida, n.º, bairro"
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
                  />
                </div>
              </div>

              <label className="mt-4 inline-flex items-center gap-2 text-xs text-ink/80">
                <input
                  type="checkbox"
                  checked={invoiceRequested}
                  onChange={(e) => setInvoiceRequested(e.target.checked)}
                  className="accent-brand"
                />
                <span>Emitir fatura comercial com os dados fiscais indicados</span>
              </label>
            </div>

            {/* Etapa 7: Seleção Transparente de Método de Pagamento por País */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-brand" />
                <h2 className="font-serif text-xl font-semibold text-ink">
                  3. Método de Pagamento para {mDef.name} ({currency})
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand bg-cream/60 p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 accent-brand"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-ink">
                      Transferência Bancária Verificada ({mDef.isoCurrency})
                    </p>
                    <p className="mt-1 leading-relaxed text-ink/70">
                      {mDef.defaultBankDetails}
                    </p>
                    <p className="mt-1.5 font-medium text-emerald-800">
                      Reserva imediata de stock por 24h · A venda só é dada como paga
                      após validação do comprovativo ou confirmação bancária.
                    </p>
                  </div>
                </label>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-ink/75">
                    Observações de Entrega / Faturação (opcional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Horário preferencial, referência interna de compra..."
                    className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs text-ink"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Etapas 5, 6 e 8 — Resumo Financeiro, Impostos, Portes e Confirmação */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-ink">
                Resumo da Encomenda ({mDef.name})
              </h2>

              <dl className="mt-5 space-y-3 border-b border-line pb-5 text-sm">
                <div className="flex justify-between text-ink/75">
                  <dt>Subtotal ilíquido</dt>
                  <dd className="font-medium text-ink">
                    {formatMoney(subtotalGross, currency)}
                  </dd>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Desconto comercial / quantidade</dt>
                    <dd className="font-semibold">
                      −{formatMoney(discountTotal, currency)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between text-ink/75">
                  <dt className="inline-flex items-center gap-1.5">
                    <Truck size={14} className="text-brand" />
                    <span>Expedição ({mDef.capitalHub})</span>
                  </dt>
                  <dd className="font-medium text-ink">
                    {shippingFee === 0
                      ? "Grátis"
                      : formatMoney(shippingFee, currency)}
                  </dd>
                </div>

                <div className="flex justify-between text-ink/75">
                  <dt>Imposto aplicável ({mDef.defaultTaxRatePercent}%)</dt>
                  <dd className="font-medium text-ink">
                    {formatMoney(taxAmount, currency)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-serif text-lg font-semibold text-ink">
                  Total a pagar ({currency})
                </span>
                <span className="font-serif text-2xl font-bold text-ink">
                  {formatMoney(grandTotal, currency)}
                </span>
              </div>

              <p className="mt-2 text-xs text-ink/60">
                Prazo estimado: {mDef.estimatedDeliveryDays}
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                  {error}
                </div>
              )}

              {status !== "authenticated" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  Ao clicar em confirmar será redirecionado para iniciar sessão ou
                  criar a sua conta comercial, preservando todo o carrinho.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>A reservar stock e registar encomenda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>
                      {status === "authenticated"
                        ? "Confirmar Encomenda e Reservar Stock"
                        : "Iniciar Sessão para Finalizar"}
                    </span>
                  </>
                )}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink/55">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>
                  Snapshot de preço, moeda e ISBN registado no ato da compra
                </span>
              </p>
            </div>
          </div>
        </div>

        {sugestoes.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Títulos complementares sugeridos
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {sugestoes.map((book, idx) => (
                <BookCard key={book.slug} book={book} index={idx} />
              ))}
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
