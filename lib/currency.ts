import type { Book } from "@/data/books";

export type Currency = "KZ" | "MT" | "EUR" | "BRL";

export const CURRENCIES: Currency[] = ["KZ", "MT", "EUR", "BRL"];

const SYMBOLS: Record<Currency, string> = {
  KZ: "Kz",
  MT: "MT",
  EUR: "€",
  BRL: "R$",
};

// Todos os preços (KZ, MT, EUR, BRL) são valores fixos definidos por livro em
// data/books.ts — decisão editorial/comercial, nunca uma conversão calculada
// em tempo real no browser a partir de uma taxa de câmbio. Isto evita preços
// desatualizados ou inconsistentes por ficarem "presos" no bundle JS entregue
// ao cliente; para atualizar um preço, edita-se o valor guardado, não uma taxa.
export function getPriceInCurrency(book: Book, currency: Currency): number {
  switch (currency) {
    case "MT":
      return book.price;
    case "KZ":
      return book.priceKZ;
    case "EUR":
      return book.priceEUR;
    case "BRL":
      return book.priceBRL;
  }
}

export function formatMoney(value: number, currency: Currency): string {
  const decimals = currency === "EUR" || currency === "BRL" ? 2 : 0;
  const formatted = value.toLocaleString("pt-PT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return currency === "EUR" || currency === "BRL"
    ? `${SYMBOLS[currency]} ${formatted}`
    : `${formatted} ${SYMBOLS[currency]}`;
}

export function formatBookPrice(book: Book, currency: Currency): string {
  return formatMoney(getPriceInCurrency(book, currency), currency);
}
