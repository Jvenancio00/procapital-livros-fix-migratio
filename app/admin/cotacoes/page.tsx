"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { QUOTE_STATUS_LABELS } from "@/lib/markets";
import type { QuoteStatus } from "@/lib/enums";

interface QuoteRow {
  id: string;
  quoteNumber: string;
  contactName: string;
  email: string;
  organizationName: string | null;
  clientType: string;
  countryCode: string;
  currency: string;
  status: QuoteStatus;
  quotedTotal: string | number | null;
  adminNotes: string | null;
  createdAt: string;
  items: { id: string; bookTitle: string; isbn: string | null; quantity: number }[];
}

export default function AdminCotacoesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [savedId, setSavedId] = useState("");

  async function load() {
    const res = await fetch("/api/admin/cotacoes");
    if (!res.ok) return;
    const json = await res.json();
    setQuotes(json.quotes ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(q: QuoteRow) {
    setSavedId("");
    const res = await fetch("/api/admin/cotacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: q.id,
        status: q.status,
        quotedTotal: q.quotedTotal,
        adminNotes: q.adminNotes,
      }),
    });
    if (res.ok) {
      setSavedId(q.id);
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Propostas Escolares, Livrarias &amp; Instituições
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Gestão de Pedidos de Cotação ({quotes.length})
        </h1>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-xs text-ink/60">
          Nenhum pedido de cotação registado no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="font-serif text-lg font-semibold text-ink">
                    {q.quoteNumber} · {q.organizationName ?? q.contactName}
                  </p>
                  <p className="text-xs text-ink/60">
                    {q.contactName} ({q.email}) · Perfil {q.clientType} ·{" "}
                    {q.countryCode} ({q.currency})
                  </p>
                </div>

                {savedId === q.id && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} />
                    Atualizado
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1 text-xs text-ink/80">
                {q.items.map((i) => (
                  <p key={i.id}>
                    <strong>{i.quantity}×</strong> {i.bookTitle}{" "}
                    {i.isbn ? `(ISBN ${i.isbn})` : ""}
                  </p>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <select
                  value={q.status}
                  onChange={(e) =>
                    setQuotes((prev) =>
                      prev.map((x, i) =>
                        i === idx
                          ? { ...x, status: e.target.value as QuoteStatus }
                          : x,
                      ),
                    )
                  }
                  className="rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs font-semibold"
                >
                  {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map(
                    (st) => (
                      <option key={st} value={st}>
                        {QUOTE_STATUS_LABELS[st]}
                      </option>
                    ),
                  )}
                </select>

                <input
                  type="number"
                  step="0.01"
                  placeholder={`Valor cotado (${q.currency})`}
                  value={q.quotedTotal ?? ""}
                  onChange={(e) =>
                    setQuotes((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, quotedTotal: e.target.value } : x,
                      ),
                    )
                  }
                  className="rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs"
                />

                <input
                  type="text"
                  placeholder="Notas da proposta / prazo..."
                  value={q.adminNotes ?? ""}
                  onChange={(e) =>
                    setQuotes((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, adminNotes: e.target.value } : x,
                      ),
                    )
                  }
                  className="rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs"
                />

                <button
                  type="button"
                  onClick={() => handleSave(q)}
                  className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                >
                  Guardar Resposta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
