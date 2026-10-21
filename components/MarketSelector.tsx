"use client";

import { Globe2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { MARKET_LIST } from "@/lib/markets";
import type { MarketCode } from "@/lib/enums";

export default function MarketSelector({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const { market, setMarket } = useCurrency();

  const styles =
    variant === "dark"
      ? "border-white/15 bg-white/5 text-white hover:border-accent/60"
      : "border-line bg-white text-ink hover:border-brand/40";

  return (
    <label className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${styles} ${className}`}>
      <Globe2 size={13} className={variant === "dark" ? "text-accent" : "text-brand"} aria-hidden="true" />
      <span className="sr-only">Selecionar mercado comercial</span>
      <select
        aria-label="Mercado comercial"
        value={market}
        onChange={(e) => setMarket(e.target.value as MarketCode)}
        className="cursor-pointer bg-transparent pr-1 font-medium focus:outline-none [&>option]:bg-ink [&>option]:text-white"
      >
        {MARKET_LIST.map((m) => (
          <option key={m.code} value={m.code}>
            {m.name} ({m.currency})
          </option>
        ))}
      </select>
    </label>
  );
}
