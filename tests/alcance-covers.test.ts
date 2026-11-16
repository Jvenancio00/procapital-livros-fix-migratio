import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { BOOKS } from "../data/books";
import { bookMatchesPublisherEntry, filterAndSortBooks } from "../lib/catalog";

const newSlugs = [
  "mandalas-para-criancas", "mandalas-criativas", "a-hora-maconde",
  "assim-nao-senhor-presidente", "feliciano-gundana", "marcelino-dos-santos",
  "matoa-a-febre-do-batuque", "mueda-nos-labirintos-dos-ritos-de-iniciacao",
  "na-terra-dos-sonhos", "nos-os-do-macurungo", "os-lobos-uma-familia-goesa",
  "samora-machel-uma-vida-interrompida", "sia-vuma-100-anos", "ualalapi",
  "xicandarinha", "zero-sobre-zero", "mais-uma-batalha",
  "os-meninos-que-transformaram-estrelas-em-livros", "os-meninos-a-bola-e-o-macaquinho",
];

test("capas Alcance estão no catálogo e são consultáveis sem preços ou stock inventados", () => {
  for (const slug of [...newSlugs, "pita-kufa-o-leito-da-morte"]) {
    const found = BOOKS.filter((b) => b.slug === slug);
    assert.equal(found.length, 1, slug);
    const book = found[0];
    assert.ok(bookMatchesPublisherEntry(book, "Alcance Editores", "EXCLUSIVO"));
    assert.equal(book.coverUrl, `/covers/${slug}.jpg`);
    assert.ok(existsSync(`public${book.coverUrl}`));
    if (slug !== "pita-kufa-o-leito-da-morte") {
      assert.deepEqual([book.price, book.priceKZ, book.priceEUR, book.priceBRL], [0, 0, 0, 0]);
      assert.deepEqual(book.stockByMarket, {});
      assert.ok(filterAndSortBooks([book], { country: "MZ" }).items.length);
    }
  }
});

test("migração adiciona títulos uma só vez e preserva dados comerciais e estado existentes", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE TABLE "Category" ("id" text primary key, "slug" text unique, "name" text unique);
      CREATE TABLE "Editora" ("id" text primary key, "slug" text unique);
      CREATE TABLE "Book" ("id" text primary key, "slug" text unique, "title" text, "author" text, "editora" text, "editoraId" text, "categoryId" text, "coverUrl" text, "countryOrigin" text, "allowQuote" boolean, "updatedAt" timestamp, "active" boolean default true, "price" integer);
      INSERT INTO "Editora" VALUES ('ed', 'alcance-editores');
      INSERT INTO "Book" ("id", "slug", "title", "author", "editora", "active", "price") VALUES
        ('existing', 'ualalapi', 'Título existente', 'Autor existente', 'Alcance Editores', false, 123),
        ('pita', 'pita-kufa-o-leito-da-morte', 'Pita Kufa', 'Carlos', 'Alcance Editores', true, 950);
    `);
    const sql = readFileSync("prisma/migrations/20261116120000_capas_alcance/migration.sql", "utf8");
    await db.exec(sql);
    await db.exec(sql);
    const result = await db.query<{ slug: string; title: string; active: boolean; price: number | null; coverUrl: string; editoraId: string | null }>('SELECT "slug", "title", "active", "price", "coverUrl", "editoraId" FROM "Book"');
    assert.equal(result.rows.length, 20);
    const existing = result.rows.find((b) => b.slug === "ualalapi")!;
    assert.equal(existing.title, "Título existente");
    assert.equal(existing.active, false);
    assert.equal(existing.price, 123);
    assert.equal(existing.coverUrl, "/covers/ualalapi.jpg");
    for (const row of result.rows.filter((b) => b.slug !== "ualalapi" && b.slug !== "pita-kufa-o-leito-da-morte")) {
      assert.equal(row.price, null);
      assert.equal(row.editoraId, "ed");
      assert.equal(row.coverUrl, `/covers/${row.slug}.jpg`);
    }
  } finally {
    await db.close();
  }
});
