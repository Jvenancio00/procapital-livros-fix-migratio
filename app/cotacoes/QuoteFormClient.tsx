"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  Trash2,
} from "lucide-react";
import type { Book } from "@/data/books";
import PageHeader from "@/components/PageHeader";
import { useCurrency } from "@/context/CurrencyContext";
import { CLIENT_TYPE_LABELS, MARKET_LIST, MARKETS } from "@/lib/markets";
import type { ClientType, MarketCode } from "@/lib/enums";

interface QuoteLineItem {
  id: string;
  slug: string;
  title: string;
  isbn: string;
  publisher: string;
  quantity: number;
}

export default function QuoteFormClient({ books }: { books: Book[] }) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { market, currency, setMarket } = useCurrency();

  const [contactName, setContactName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [clientType, setClientType] = useState<ClientType>(
    (searchParams.get("perfil") as ClientType) || "ESCOLA",
  );
  const [academicYear, setAcademicYear] = useState("2026");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuoteLineItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [quoteCode, setQuoteCode] = useState("");

  useEffect(() => {
    if (session?.user?.name && !contactName) setContactName(session.user.name);
    if (session?.user?.email && !email) setEmail(session.user.email);
  }, [session, contactName, email]);

  useEffect(() => {
    const urlPais = searchParams.get("pais")?.toUpperCase();
    if (urlPais && ["AO", "MZ", "PT", "BR"].includes(urlPais)) {
      setMarket(urlPais as MarketCode);
    }

    const initial: QuoteLineItem[] = [];
    const singleSlug = searchParams.get("livro");
    const singleQty = Number(searchParams.get("qtd") || 10);
    if (singleSlug) {
      const matched = books.find((b) => b.slug === singleSlug);
      if (matched) {
        initial.push({
          id: crypto.randomUUID(),
          slug: matched.slug,
          title: matched.title,
          isbn: matched.isbn ?? "",
          publisher: matched.editora,
          quantity: Math.max(1, singleQty),
        });
      }
    }

    const bulk = searchParams.get("itens");
    if (bulk) {
      for (const pair of bulk.split(",")) {
        const [slug, qtyStr] = pair.split(":");
        const matched = books.find((b) => b.slug === slug);
        if (matched) {
          initial.push({
            id: crypto.randomUUID(),
            slug: matched.slug,
            title: matched.title,
            isbn: matched.isbn ?? "",
            publisher: matched.editora,
            quantity: Math.max(1, Number(qtyStr) || 1),
          });
        }
      }
    }

    if (initial.length === 0) {
      initial.push({
        id: crypto.randomUUID(),
        slug: "",
        title: "",
        isbn: "",
        publisher: "",
        quantity: 10,
      });
    }
    setItems(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        slug: "",
        title: "",
        isbn: "",
        publisher: "",
        quantity: 10,
      },
    ]);
  }

  function selectCatalogBook(rowId: string, slug: string) {
    const matched = books.find((b) => b.slug === slug);
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              slug,
              title: matched?.title ?? row.title,
              isbn: matched?.isbn ?? row.isbn,
              publisher: matched?.editora ?? row.publisher,
            }
          : row,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const validItems = items.filter((i) => i.title.trim() || i.slug);
    if (validItems.length === 0) {
      setStatus("error");
      setErrorMessage("Indique pelo menos um livro ou ISBN na lista de cotação.");
      return;
    }

    try {
      const res = await fetch("/api/cotacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName,
          email,
          phone,
          organizationName,
          taxId,
          clientType,
          countryCode: market,
          currency,
          academicYear: Number(academicYear) || undefined,
          deliveryAddress,
          notes,
          items: validItems,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "Erro ao registar pedido de cotação.");
        return;
      }
      setStatus("success");
      setQuoteCode(json.quoteNumber ?? json.quote?.quoteNumber ?? "");
    } catch {
      setStatus("error");
      setErrorMessage("Falha de ligação ao submeter o pedido de cotação.");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="rounded-3xl border border-line bg-white p-10 text-center shadow-sm">
          <CheckCircle2 size={44} className="mx-auto text-emerald-700" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Pedido Registado com Sucesso
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
            Cotação {quoteCode} em análise comercial
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/70">
            A equipa comercial Pro Capital validará disponibilidade por armazém,
            prazos de importação/expedição e condições para{" "}
            <strong>{MARKETS[market].name}</strong>, respondendo para{" "}
            <strong>{email}</strong>.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/livros-escolares"
              className="rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              Explorar livros escolares
            </Link>
            <Link
              href="/catalogo"
              className="rounded-full border border-line px-6 py-3 text-xs font-semibold text-ink hover:border-ink/40"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Canal B2B, Escolar & Institucional"
        title="Solicitar Cotação Comercial ou Proforma"
        description="Ideal para encomendas em quantidade de livrarias, escolas, universidades, empresas, ONGs ou títulos sob consulta por ISBN."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Pedidos de Cotação" },
        ]}
      />

      <section className="mx-auto max-w-5xl px-5 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-line bg-white p-7 sm:p-10"
        >
          {/* Secção 1: Perfil Comprador e Mercado */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">
              1. Identificação do Perfil Comprador e Mercado
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-ink/75">
                  Perfil de Comprador *
                </label>
                <select
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value as ClientType)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                >
                  {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((type) => (
                    <option key={type} value={type}>
                      {CLIENT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/75">
                  País / Mercado de Entrega *
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value as MarketCode)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm font-semibold text-ink"
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
                  Ano Letivo (se aplicável)
                </label>
                <input
                  type="number"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/75">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex.: Dra. Ana Machel"
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/75">
                  Email Institucional / Profissional *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="compras@instituicao.org"
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/75">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 / +244 / +351 / +55"
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink/75">
                  Nome da Livraria, Escola, Empresa ou Instituição
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Denominação social ou nome da instituição"
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/75">
                  Identificação Fiscal ({MARKETS[market].taxIdLabel})
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder={MARKETS[market].taxIdLabel}
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>
            </div>
          </div>

          {/* Secção 2: Lista de Títulos / ISBNs */}
          <div className="border-t border-line pt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-ink">
                  2. Títulos, Manuais ou Lista ISBN Pretendida
                </h2>
                <p className="text-xs text-ink/60">
                  Selecione obras do catálogo ou introduza manualmente ISBN e título
                  para encomenda especial junto das editoras.
                </p>
              </div>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
              >
                <Plus size={14} />
                Adicionar linha
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-2xl border border-line/80 bg-cream/35 p-4 md:grid-cols-12"
                >
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-ink/65">
                      Selecionar do Catálogo (opcional)
                    </label>
                    <select
                      value={row.slug}
                      onChange={(e) => selectCatalogBook(row.id, e.target.value)}
                      className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink"
                    >
                      <option value="">— Escolher livro ou preencher ao lado —</option>
                      {books.map((b) => (
                        <option key={b.slug} value={b.slug}>
                          {b.title} ({b.editora})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-ink/65">
                      Título da Obra *
                    </label>
                    <input
                      type="text"
                      required
                      value={row.title}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, title: e.target.value } : r,
                          ),
                        )
                      }
                      placeholder="Título do manual ou livro"
                      className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-ink"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-ink/65">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={row.isbn}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, isbn: e.target.value } : r,
                          ),
                        )
                      }
                      placeholder="978..."
                      className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-mono text-xs text-ink"
                    />
                  </div>

                  <div className="flex items-end gap-2 md:col-span-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-ink/65">
                        Qtd. *
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={row.quantity}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, quantity: Math.max(1, Number(e.target.value)) }
                                : r,
                            ),
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        aria-label="Remover linha"
                        onClick={() =>
                          setItems((prev) => prev.filter((r) => r.id !== row.id))
                        }
                        className="rounded-xl border border-line bg-white p-2 text-ink/50 hover:text-brand"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secção 3: Entrega & Observações */}
          <div className="grid gap-4 border-t border-line pt-7 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Cidade / Província e Morada de Entrega
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={`Ex.: ${MARKETS[market].capitalHub}, rua, bairro, número`}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Observações ou Prazos Pretendidos
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: Necessidade de fatura proforma carimbada"
                className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-xs text-ink/60">
              Moeda da proposta: <strong>{currency}</strong> ({MARKETS[market].name})
            </p>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-55"
            >
              <FileSpreadsheet size={16} />
              <span>
                {status === "loading"
                  ? "A registar pedido..."
                  : "Enviar Pedido de Cotação Formal"}
              </span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
