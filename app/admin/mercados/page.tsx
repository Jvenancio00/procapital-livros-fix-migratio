"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface MarketRow {
  code: string;
  name: string;
  currency: string;
  isoCurrency: string;
  taxRatePercent: string | number;
  shippingFlatFee: string | number;
  freeShippingThreshold: string | number | null;
  estimatedDeliveryDays: string;
  bankTransferEnabled: boolean;
  bankAccountDetails: string | null;
  active: boolean;
}

export default function AdminMercadosPage() {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
  const [savedCode, setSavedCode] = useState("");

  async function load() {
    const res = await fetch("/api/admin/mercados");
    if (!res.ok) return;
    const json = await res.json();
    setMarkets(json.markets ?? []);
    setEnvStatus(json.gatewayEnvStatus ?? {});
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(row: MarketRow) {
    setSavedCode("");
    const res = await fetch("/api/admin/mercados", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (res.ok) {
      setSavedCode(row.code);
      await load();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Configuração Multi-País &amp; Pagamentos
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Mercados Nacionais, Moedas, Impostos e Expedição
        </h1>
      </div>

      {/* Estado Transparente das Credenciais de Gateways */}
      <div className="rounded-2xl border border-line bg-white p-5 text-xs">
        <p className="font-semibold text-ink">
          Diagnóstico Real de Gateways Externos (Variáveis de Ambiente)
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <span className="rounded-full bg-cream-deep px-3 py-1 font-medium">
            Stripe (EUR / BRL):{" "}
            <strong>
              {envStatus.stripeConfigured
                ? "Ativo"
                : "Não configurado (apenas Transferência / Cotação)"}
            </strong>
          </span>
          <span className="rounded-full bg-cream-deep px-3 py-1 font-medium">
            M-Pesa API (MZN):{" "}
            <strong>
              {envStatus.mpesaConfigured
                ? "Ativo"
                : "Não configurado (Transferência Bancária ativa)"}
            </strong>
          </span>
          <span className="rounded-full bg-cream-deep px-3 py-1 font-medium">
            HMAC Webhook Secret:{" "}
            <strong>
              {envStatus.webhookSecretConfigured ? "Configurado" : "Não configurado"}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {markets.map((m, idx) => (
          <div
            key={m.code}
            className="space-y-4 rounded-2xl border border-line bg-white p-6"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-ink">
                  {m.name} ({m.code})
                </h2>
                <p className="text-xs text-ink/55">
                  Moeda Oficial: {m.currency} ({m.isoCurrency})
                </p>
              </div>
              {savedCode === m.code && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Guardado
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-ink/70">IVA / Imposto (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={m.taxRatePercent}
                  onChange={(e) =>
                    setMarkets((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, taxRatePercent: e.target.value } : x,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-line bg-cream/40 px-3 py-2"
                />
              </div>

              <div>
                <label className="font-semibold text-ink/70">
                  Portes Fixos ({m.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={m.shippingFlatFee}
                  onChange={(e) =>
                    setMarkets((prev) =>
                      prev.map((x, i) =>
                        i === idx ? { ...x, shippingFlatFee: e.target.value } : x,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-line bg-cream/40 px-3 py-2"
                />
              </div>

              <div>
                <label className="font-semibold text-ink/70">
                  Portes Grátis Acima
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={m.freeShippingThreshold ?? ""}
                  onChange={(e) =>
                    setMarkets((prev) =>
                      prev.map((x, i) =>
                        i === idx
                          ? { ...x, freeShippingThreshold: e.target.value }
                          : x,
                      ),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-line bg-cream/40 px-3 py-2"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-semibold text-ink/70">
                Prazo Estimado de Entrega
              </label>
              <input
                type="text"
                value={m.estimatedDeliveryDays}
                onChange={(e) =>
                  setMarkets((prev) =>
                    prev.map((x, i) =>
                      i === idx
                        ? { ...x, estimatedDeliveryDays: e.target.value }
                        : x,
                    ),
                  )
                }
                className="mt-1 w-full rounded-xl border border-line bg-cream/40 px-3 py-2"
              />
            </div>

            <div className="text-xs">
              <label className="font-semibold text-ink/70">
                Instruções Bancárias Oficiais
              </label>
              <textarea
                rows={3}
                value={m.bankAccountDetails ?? ""}
                onChange={(e) =>
                  setMarkets((prev) =>
                    prev.map((x, i) =>
                      i === idx
                        ? { ...x, bankAccountDetails: e.target.value }
                        : x,
                    ),
                  )
                }
                className="mt-1 w-full rounded-xl border border-line bg-cream/40 p-3"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSave(m)}
              className="rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              Guardar Configuração ({m.code})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
