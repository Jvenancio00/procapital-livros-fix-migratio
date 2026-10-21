import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  FileDown,
  FileSpreadsheet,
  Globe2,
  Package,
  ShoppingBag,
  Upload,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { ORDER_STATUS_LABELS, QUOTE_STATUS_LABELS } from "@/lib/markets";
import type { Currency } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    bookCount,
    publisherCount,
    userCount,
    quoteCount,
    orders,
    stockItems,
    recentBatches,
    recentQuotes,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.editora.count(),
    prisma.user.count(),
    prisma.quoteRequest.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.stockItem.findMany({
      include: {
        book: { select: { title: true, isbn: true } },
        warehouse: { select: { code: true, name: true, countryCode: true } },
      },
    }),
    prisma.importBatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const confirmedStatuses = new Set(["PAID", "PROCESSING", "SHIPPED", "COMPLETED"]);
  const revenueByCurrency: Record<Currency, number> = {
    MT: 0,
    KZ: 0,
    EUR: 0,
    BRL: 0,
  };
  let pendingOrders = 0;

  for (const o of orders) {
    if (confirmedStatuses.has(o.status)) {
      revenueByCurrency[o.currency] =
        (revenueByCurrency[o.currency] ?? 0) + Number(o.totalAmount);
    } else if (o.status === "PENDING" || o.status === "AWAITING_PAYMENT") {
      pendingOrders += 1;
    }
  }

  const lowStock = stockItems.filter(
    (s) => Math.max(0, s.quantity - s.reserved) <= s.lowStockThreshold,
  );
  const totalAvailableUnits = stockItems.reduce(
    (sum, s) => sum + Math.max(0, s.quantity - s.reserved),
    0,
  );
  const totalReservedUnits = stockItems.reduce((sum, s) => sum + s.reserved, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Gestão Operacional &amp; Relatórios
          </span>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Visão Geral da Distribuidora
          </h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/importacoes"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            <Upload size={14} />
            <span>Importar Stock / Livros (.xlsx / .csv)</span>
          </Link>
          <Link
            href="/admin/catalogos"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40"
          >
            <FileDown size={14} />
            <span>Gerar Catálogo PDF</span>
          </Link>
        </div>
      </div>

      {/* KPIs Reais Ligados ao PostgreSQL */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>Catálogo &amp; Editoras</span>
            <BookOpen size={16} className="text-brand" />
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-ink">{bookCount}</p>
          <p className="mt-1 text-xs text-ink/60">
            títulos em <strong>{publisherCount}</strong> editoras registadas
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>Stock Disponível (4 Países)</span>
            <Package size={16} className="text-brand" />
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-ink">
            {totalAvailableUnits}
          </p>
          <p className="mt-1 text-xs text-ink/60">
            un. livres · <strong>{totalReservedUnits}</strong> reservadas no checkout
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>Encomendas &amp; Cotações</span>
            <ShoppingBag size={16} className="text-brand" />
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-ink">
            {orders.length}
          </p>
          <p className="mt-1 text-xs text-ink/60">
            <strong>{pendingOrders}</strong> a aguardar pagamento ·{" "}
            <strong>{quoteCount}</strong> cotações pendentes
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between text-xs text-ink/60">
            <span>Contas &amp; Alertas de Stock</span>
            <Users size={16} className="text-brand" />
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-ink">{userCount}</p>
          <p className="mt-1 text-xs text-amber-800">
            <strong>{lowStock.length}</strong> registos em stock baixo
          </p>
        </div>
      </div>

      {/* Receita Confirmada por Moeda (nunca mistura moedas nem inclui pagamentos não confirmados) */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-serif text-xl font-semibold text-ink">
          Vendas Confirmadas por Moeda Oficial
        </h2>
        <p className="text-xs text-ink/60">
          Contabiliza exclusivamente encomendas com pagamento confirmado (Paga, Em
          preparação, Enviada ou Concluída).
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["MT", "KZ", "EUR", "BRL"] as Currency[]).map((cur) => (
            <div
              key={cur}
              className="rounded-xl border border-line/80 bg-cream/50 p-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">
                Moeda {cur}
              </span>
              <p className="mt-1 font-serif text-2xl font-bold text-ink">
                {formatMoney(revenueByCurrency[cur], cur)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas de Stock Baixo + Últimas Importações & Cotações */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 font-serif text-lg font-semibold text-ink">
              <AlertTriangle size={17} className="text-amber-600" />
              <span>Alertas de Stock Baixo ({lowStock.length})</span>
            </h2>
            <Link
              href="/admin/stock"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Gerir armazéns →
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="mt-4 text-xs text-emerald-700">
              Todos os armazéns acima do limite mínimo configurado.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-line/70 text-xs">
              {lowStock.slice(0, 7).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-semibold text-ink">{item.book.title}</p>
                    <p className="text-ink/55">
                      {item.warehouse.code} ({item.warehouse.countryCode})
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">
                    {Math.max(0, item.quantity - item.reserved)} disp. (mín.{" "}
                    {item.lowStockThreshold})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink">
              Últimos Pedidos de Cotação &amp; Importações
            </h2>
            <Link
              href="/admin/cotacoes"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Ver cotações →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-line/70 text-xs">
            {recentQuotes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {q.quoteNumber} · {q.organizationName ?? q.contactName}
                  </p>
                  <p className="text-ink/55">
                    {q.countryCode} ({q.currency})
                  </p>
                </div>
                <span className="rounded-full bg-cream-deep px-2.5 py-1 font-semibold text-ink">
                  {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                </span>
              </div>
            ))}

            {recentBatches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-semibold text-ink">
                    Importação: {b.filename}
                  </p>
                  <p className="text-ink/55">
                    {b.createdBooks + b.updatedStock + b.updatedPrices} operações ({b.totalRows} linhas)
                  </p>
                </div>
                <Link
                  href="/admin/importacoes"
                  className="font-semibold text-brand hover:underline"
                >
                  Relatório
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grelha Rápida de Módulos Administrativos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            href: "/admin/livros",
            title: "Livros, Capas & Preços",
            desc: "Criar/editar obras, ISBN, níveis escolares e preços nos 4 países.",
            icon: BookOpen,
          },
          {
            href: "/admin/editoras",
            title: "Editoras & Logótipos",
            desc: "Gerir chancelas representadas, contactos e ficheiros de marca.",
            icon: Building2,
          },
          {
            href: "/admin/mercados",
            title: "Países, Impostos & Portes",
            desc: "Configurar Angola, Moçambique, Portugal e Brasil independentemente.",
            icon: Globe2,
          },
          {
            href: "/admin/cotacoes",
            title: "Cotações & Propostas B2B",
            desc: "Responder a listas escolares e converter cotações em encomendas.",
            icon: FileSpreadsheet,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-5 transition-all hover:border-brand/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Icon size={18} className="text-brand" />
                  <ArrowUpRight
                    size={15}
                    className="text-ink/40 group-hover:text-brand"
                  />
                </div>
                <h3 className="mt-3 font-serif text-base font-semibold text-ink">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink/65">
                  {card.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
