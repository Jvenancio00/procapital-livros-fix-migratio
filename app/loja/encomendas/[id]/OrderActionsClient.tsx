"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileCheck2, RefreshCw } from "lucide-react";
import type { Book } from "@/data/books";
import { useCart } from "@/context/CartContext";

export default function OrderActionsClient({
  orderId,
  paymentStatus,
  existingProof,
  repeatableItems,
}: {
  orderId: string;
  paymentStatus: string;
  existingProof: string | null;
  repeatableItems: Array<{ book: Book; quantity: number }>;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [proofRef, setProofRef] = useState(existingProof ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function handleSubmitProof(e: React.FormEvent) {
    e.preventDefault();
    if (!proofRef.trim()) return;
    setLoading(true);
    setError("");
    setFeedback("");

    try {
      const res = await fetch("/api/pagamentos/comprovativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          transferProofRef: proofRef.trim(),
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro ao submeter comprovativo.");
      } else {
        setFeedback(
          "Comprovativo registado para verificação comercial. A reserva de stock foi estendida por 48h.",
        );
        router.refresh();
      }
    } catch {
      setError("Falha de rede ao enviar comprovativo.");
    } finally {
      setLoading(false);
    }
  }

  function handleRepeatOrder() {
    for (const entry of repeatableItems) {
      addItem(entry.book, entry.quantity);
    }
    router.push("/carrinho");
  }

  return (
    <div className="mt-8 space-y-6">
      {paymentStatus !== "CONFIRMED" && (
        <form
          onSubmit={handleSubmitProof}
          className="rounded-2xl border border-line bg-white p-6"
        >
          <div className="flex items-center gap-2">
            <FileCheck2 size={18} className="text-brand" />
            <h2 className="font-serif text-lg font-semibold text-ink">
              Submeter Comprovativo de Transferência Bancária
            </h2>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink/65">
            Indique o código de transação bancária / IBAN / referência do borderô. O
            pagamento ficará em <strong>Em verificação</strong> até confirmação pela
            equipa financeira (nunca simulado automaticamente).
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Referência / Código da Operação *
              </label>
              <input
                type="text"
                required
                value={proofRef}
                onChange={(e) => setProofRef(e.target.value)}
                placeholder="Ex.: TRF-2026-884920"
                className="mt-1 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2 text-xs text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Banco / Observação (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: BIM / BAI / BPI / Banco do Brasil"
                className="mt-1 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2 text-xs text-ink"
              />
            </div>
          </div>

          {feedback && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              <span>{feedback}</span>
            </p>
          )}
          {error && <p className="mt-3 text-xs font-semibold text-red-700">{error}</p>}

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? "A registar..." : "Enviar Comprovativo"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-cream-deep/50 p-5">
        <div>
          <p className="text-sm font-semibold text-ink">
            Documento Comercial &amp; Repetição de Encomenda
          </p>
          <p className="text-xs text-ink/65">
            Descarregue a Fatura Proforma / Nota de Encomenda oficial em PDF ou
            volte a colocar todos os artigos no carrinho com um clique.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`/api/encomendas/${orderId}/documento`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            <FileCheck2 size={14} />
            <span>Documento Comercial (PDF)</span>
          </a>
          {repeatableItems.length > 0 && (
            <button
              type="button"
              onClick={handleRepeatOrder}
              className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-xs font-semibold text-white hover:bg-ink/90"
            >
              <RefreshCw size={14} />
              <span>Repetir Encomenda</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
