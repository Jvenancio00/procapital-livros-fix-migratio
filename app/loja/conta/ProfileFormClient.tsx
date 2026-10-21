"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { CLIENT_TYPE_LABELS, MARKET_LIST, MARKETS } from "@/lib/markets";
import type { ClientType, MarketCode } from "@/lib/enums";

export default function ProfileFormClient({
  initialProfile,
}: {
  initialProfile: {
    type: ClientType;
    companyName: string;
    taxId: string;
    countryCode: MarketCode;
    phone: string;
    city: string;
    billingAddress: string;
    approvedB2B: boolean;
    discountPercent: number;
  };
}) {
  const [form, setForm] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/cliente/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro ao guardar perfil.");
      } else {
        setSaved(true);
      }
    } catch {
      setError("Falha de rede ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-line bg-white p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">
            Perfil de Comprador &amp; Dados Fiscais
          </h2>
          <p className="text-xs text-ink/60">
            Estes dados preenchem automaticamente o checkout, faturas e pedidos de
            cotação.
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            form.approvedB2B
              ? "bg-emerald-50 text-emerald-800"
              : "bg-cream-deep text-ink/75"
          }`}
        >
          {form.approvedB2B
            ? `Condição B2B Aprovada (−${form.discountPercent}%)`
            : CLIENT_TYPE_LABELS[form.type]}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-ink/75">
            Tipo de Perfil
          </label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((p) => ({ ...p, type: e.target.value as ClientType }))
            }
            className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs font-semibold text-ink"
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
            País / Mercado Principal
          </label>
          <select
            value={form.countryCode}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                countryCode: e.target.value as MarketCode,
              }))
            }
            className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs font-semibold text-ink"
          >
            {MARKET_LIST.map((m) => (
              <option key={m.code} value={m.code}>
                {m.name} ({m.currency})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/75">
            Empresa / Livraria / Escola / Instituição
          </label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) =>
              setForm((p) => ({ ...p, companyName: e.target.value }))
            }
            className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs text-ink"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/75">
            Identificação Fiscal ({MARKETS[form.countryCode].taxIdLabel})
          </label>
          <input
            type="text"
            value={form.taxId}
            onChange={(e) => setForm((p) => ({ ...p, taxId: e.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs text-ink"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/75">
            Telefone Comercial
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs text-ink"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/75">
            Cidade / Província
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs text-ink"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-ink/75">
            Morada de Faturação e Entrega
          </label>
          <input
            type="text"
            value={form.billingAddress}
            onChange={(e) =>
              setForm((p) => ({ ...p, billingAddress: e.target.value }))
            }
            className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-xs text-ink"
          />
        </div>
      </div>

      {saved && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={14} />
          <span>Perfil comercial atualizado com sucesso.</span>
        </p>
      )}
      {error && <p className="mt-4 text-xs font-semibold text-red-700">{error}</p>}

      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Guardar Perfil Comercial"}
        </button>
      </div>
    </form>
  );
}
