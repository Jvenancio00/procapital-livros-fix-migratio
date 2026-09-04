"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES } from "@/lib/currency";

export default function CurrencySelector({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as typeof currency)}
      aria-label="Moeda"
      className={`rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink focus:border-brand/40 focus:outline-none ${className}`}
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
