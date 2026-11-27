import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_MODE, publicCatalogBook } from "../lib/demo";
import { BOOKS } from "../data/books";
import { getAllCatalogBooks } from "../lib/catalog";
import { POST as checkout } from "../app/api/checkout/route";
import { generateCatalogPdfBuffer } from "../lib/pdf-catalog";

const sample = BOOKS.find((book) => book.price > 0)!;

test("catálogo demonstrativo preserva dados originais mas não expõe preços", async () => {
  assert.equal(DEMO_MODE, true);
  const originalPrice = sample.price;
  assert.equal(publicCatalogBook(sample).price, 0);
  assert.equal(sample.price, originalPrice);
  const books = await getAllCatalogBooks();
  assert.ok(books.length > 0);
  assert.ok(books.every((b) => [b.price, b.priceKZ, b.priceEUR, b.priceBRL].every((p) => p === 0)));
});

test("checkout é bloqueado no servidor antes de processar o pedido", async () => {
  const result = await checkout(new Request("http://localhost/api/checkout", { method: "POST" }));
  assert.equal(result.status, 503);
});

test("PDF demonstrativo não inclui o preço de referência do livro", () => {
  const pdf = generateCatalogPdfBuffer({ books: [sample], market: "MZ", currency: "MT" }).toString("latin1");
  assert.ok(pdf.includes("Sob consulta"));
  assert.ok(!pdf.includes(`${sample.price} MT`));
});
