"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StockRow {
  id: string;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
  book: { id: string; slug: string; title: string; isbn: string | null; editora: string };
  warehouse: { id: string; code: string; name: string; countryCode: string };
}

interface MovementRow {
  id: string;
  type: string;
  delta: number;
  previousQty: number;
  newQty: number;
  reason: string | null;
  actorEmail: string | null;
  createdAt: string;
  stockItem: {
    book: { title: string; isbn: string | null };
    warehouse: { code: string; countryCode: string };
  };
}

export default function AdminStockPage() {
  const [items, setItems] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [delta, setDelta] = useState("10");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    const res = await fetch("/api/admin/stock");
    if (!res.ok) return;
    const json = await res.json();
    setItems(json.stockItems ?? []);
    setMovements(json.recentMovements ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");
    setError("");
    const res = await fetch("/api/admin/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stockItemId: selectedId,
        delta: Number(delta),
        reason,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erro no ajuste de stock.");
      return;
    }
    setFeedback("Ajuste registado com histórico e auditoria.");
    setReason("");
    await loadData();
  }

  const visibleItems = items.filter((item) => {
    if (countryFilter && item.warehouse.countryCode !== countryFilter) return false;
    if (
      onlyLow &&
      Math.max(0, item.quantity - item.reserved) > item.lowStockThreshold
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Inventário Multi-País &amp; Rastreabilidade
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Gestão de Stock e Armazéns (AO · MZ · PT · BR)
        </h1>
      </div>

      {/* Formulário de Ajuste Manual Auditado */}
      <form
        onSubmit={handleAdjust}
        className="rounded-2xl border border-line bg-white p-6"
      >
        <h2 className="font-serif text-lg font-semibold text-ink">
          Ajuste Manual de Stock com Registo de Motivo
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <select
              required
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
            >
              <option value="">Selecionar Livro / Armazém...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.warehouse.countryCode} · {item.warehouse.code}]{" "}
                  {item.book.title} (Atual: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <input
              type="number"
              required
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="+10 ou -5"
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs font-semibold text-ink"
            />
          </div>

          <div className="md:col-span-3">
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo obrigatório (ex.: Receção editora)"
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs text-ink"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="h-full w-full rounded-full bg-brand px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              Registar Ajuste
            </button>
          </div>
        </div>

        {feedback && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            {feedback}
          </p>
        )}
        {error && <p className="mt-3 text-xs font-semibold text-red-700">{error}</p>}
      </form>

      {/* Tabela de Stock Atual */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Stock por País e Armazém ({visibleItems.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-xl border border-line bg-cream/40 px-3 py-1.5 font-semibold"
            >
              <option value="">Todos os países</option>
              <option value="MZ">Moçambique (MZ)</option>
              <option value="AO">Angola (AO)</option>
              <option value="PT">Portugal (PT)</option>
              <option value="BR">Brasil (BR)</option>
            </select>

            <label className="inline-flex items-center gap-1.5 font-medium">
              <input
                type="checkbox"
                checked={onlyLow}
                onChange={(e) => setOnlyLow(e.target.checked)}
                className="accent-brand"
              />
              <span>Apenas stock baixo</span>
            </label>
          </div>
        </div>

        <div className="mt-4 max-h-[420px] overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream uppercase text-ink/60">
              <tr>
                <th className="px-3 py-2.5">País / Armazém</th>
                <th className="px-3 py-2.5">Livro / ISBN</th>
                <th className="px-3 py-2.5">Total Físico</th>
                <th className="px-3 py-2.5">Reservado</th>
                <th className="px-3 py-2.5">Disponível Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {visibleItems.map((row) => {
                const avail = Math.max(0, row.quantity - row.reserved);
                const low = avail <= row.lowStockThreshold;
                return (
                  <tr key={row.id}>
                    <td className="px-3 py-2.5 font-semibold">
                      {row.warehouse.countryCode} · {row.warehouse.code}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-ink">{row.book.title}</p>
                      <p className="font-mono text-[10px] text-ink/55">
                        {row.book.isbn ?? "Sem ISBN"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">{row.quantity}</td>
                    <td className="px-3 py-2.5 text-amber-800">{row.reserved}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold ${
                          low
                            ? "bg-amber-50 text-amber-800"
                            : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {low && <AlertTriangle size={11} />}
                        {avail} un.
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico Recente de Movimentos de Stock */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">
          Histórico Auditado de Movimentos de Stock
        </h2>
        <div className="mt-4 max-h-80 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream uppercase text-ink/60">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Armazém</th>
                <th className="px-3 py-2">Livro</th>
                <th className="px-3 py-2">Tipo / Variação</th>
                <th className="px-3 py-2">Motivo / Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="px-3 py-2">
                    {new Date(m.createdAt).toLocaleString("pt-PT")}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {m.stockItem.warehouse.code}
                  </td>
                  <td className="px-3 py-2 font-medium text-ink">
                    {m.stockItem.book.title}
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    {m.type} ({m.delta >= 0 ? `+${m.delta}` : m.delta}:{" "}
                    {m.previousQty} → {m.newQty})
                  </td>
                  <td className="px-3 py-2 text-ink/65">
                    {m.reason ?? "—"} {m.actorEmail ? `(${m.actorEmail})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
