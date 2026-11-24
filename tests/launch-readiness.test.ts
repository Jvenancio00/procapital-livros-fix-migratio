import { test } from "node:test";
import assert from "node:assert/strict";
import { knownMarketStock } from "../lib/availability";
import { getBookAvailableStock } from "../lib/catalog";
import { BOOKS } from "../data/books";
import { DICTIONARIES, DEFAULT_LANGUAGE } from "../lib/i18n/languages";
import { SITE_URL } from "../lib/site";

test("stock desconhecido não é tratado como unidades disponíveis", () => {
  const book = { ...BOOKS[0], stockByMarket: undefined };
  assert.equal(knownMarketStock(book, "MZ"), null);
  assert.equal(getBookAvailableStock(book, "MZ"), 0);
  assert.equal(knownMarketStock({ stockByMarket: { MZ: 3 } }, "MZ"), 3);
  assert.equal(knownMarketStock({ stockByMarket: { MZ: 0 } }, "MZ"), 0);
});

test("idioma padrão e rótulos dos indicadores estão definidos", () => {
  assert.equal(DEFAULT_LANGUAGE, "pt");
  for (const dictionary of Object.values(DICTIONARIES)) {
    assert.ok(dictionary.hero.statTitles && dictionary.hero.statPublishers && dictionary.hero.statSchool && dictionary.hero.statMarkets);
  }
});

test("URL canónico temporário configurável sem barra final", () => {
  const expected = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://procapital-livros-fix-migration.vercel.app").replace(/\/+$/, "");
  assert.equal(SITE_URL, expected);
});
