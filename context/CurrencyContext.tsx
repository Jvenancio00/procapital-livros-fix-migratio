"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Currency } from "@/lib/currency";
import type { MarketCode } from "@/lib/enums";
import { currencyForMarket, marketForCurrency } from "@/lib/markets";

interface CurrencyContextValue {
  currency: Currency;
  market: MarketCode;
  setCurrency: (currency: Currency) => void;
  setMarket: (market: MarketCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const CURRENCY_STORAGE_KEY = "procapital-currency";
const MARKET_STORAGE_KEY = "procapital-market";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("MT");
  const [market, setMarketState] = useState<MarketCode>("MZ");

  useEffect(() => {
    try {
      const storedMarket = localStorage.getItem(MARKET_STORAGE_KEY) as MarketCode | null;
      const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
      if (storedMarket && ["AO", "MZ", "PT", "BR"].includes(storedMarket)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMarketState(storedMarket);
        if (storedCurrency && ["KZ", "MT", "EUR", "BRL"].includes(storedCurrency)) {
          setCurrencyState(storedCurrency);
        } else {
          setCurrencyState(currencyForMarket(storedMarket));
        }
      } else if (storedCurrency && ["KZ", "MT", "EUR", "BRL"].includes(storedCurrency)) {
        setCurrencyState(storedCurrency);
        setMarketState(marketForCurrency(storedCurrency));
      }
    } catch {
      // sem preferência guardada
    }
  }, []);

  const setCurrency = (value: Currency) => {
    setCurrencyState(value);
    const syncedMarket = marketForCurrency(value);
    setMarketState(syncedMarket);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, value);
      localStorage.setItem(MARKET_STORAGE_KEY, syncedMarket);
    } catch {
      // armazenamento indisponível
    }
  };

  const setMarket = (nextMarket: MarketCode) => {
    setMarketState(nextMarket);
    const localCur = currencyForMarket(nextMarket);
    setCurrencyState(localCur);
    try {
      localStorage.setItem(MARKET_STORAGE_KEY, nextMarket);
      localStorage.setItem(CURRENCY_STORAGE_KEY, localCur);
    } catch {
      // armazenamento indisponível
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, market, setCurrency, setMarket }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency deve ser usado dentro de <CurrencyProvider>");
  return ctx;
}
