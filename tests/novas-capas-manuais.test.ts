import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { BOOKS } from "../data/books";
import { bookMatchesPublisherEntry } from "../lib/catalog";

const slugs = ["vamos-ler-e-escrever-lingua-portuguesa-1a-classe", "major-general-mariano-matsinha", ...["biologia-10", "biologia-12", "filosofia-12", "fisica-10", "fisica-12", "geografia-10", "geografia-12", "portugues-10", "quimica-10", "quimica-12"].map(s => `preparacao-para-exames-${s}a-classe`)];

test("novos títulos, capas e associação ao autor representado", () => {
  for (const slug of slugs) {
    const matches = BOOKS.filter(b => b.slug === slug);
    assert.equal(matches.length, 1, slug);
    const b = matches[0];
    assert.equal(b.coverUrl, `/covers/${slug}.jpg`);
    assert.ok(existsSync(`public${b.coverUrl}`));
    assert.deepEqual([b.price, b.priceKZ, b.priceEUR, b.priceBRL], [0, 0, 0, 0]);
    assert.deepEqual(b.stockByMarket, {});
  }
  assert.ok(bookMatchesPublisherEntry(BOOKS.find(b => b.slug === "major-general-mariano-matsinha")!, "Renato Matusse", "AUTOR"));
  assert.ok(existsSync("public/backcovers/major-general-mariano-matsinha.jpg"));
});

test("migração preserva preços, stock e estado dos títulos existentes", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE TYPE "EducationLevel" AS ENUM ('ENSINO_PRIMARIO', 'ENSINO_SECUNDARIO');
      CREATE TABLE "Category" ("id" text primary key, "slug" text unique, "name" text unique);
      CREATE TABLE "Editora" ("id" text primary key, "name" text unique);
      CREATE TABLE "Book" ("id" text primary key, "slug" text unique, "title" text, "author" text, "editora" text, "editoraId" text, "categoryId" text, "coverUrl" text, "countryOrigin" text, "allowQuote" boolean, "schoolGrade" text, "subject" text, "educationLevel" "EducationLevel", "updatedAt" timestamp, "active" boolean default true, "price" integer);
      INSERT INTO "Editora" VALUES ('ed','Alcance Editores'), ('autor','Renato Matusse');
      INSERT INTO "Book" ("id", "slug", "title", "author", "editora", "active", "price") VALUES ('existing','educacao-visual-e-oficios-6a-classe','Livro existente','Autores','Alcance Editores',false,650);
    `);
    const sql = readFileSync("prisma/migrations/20261116140000_capas_manuais_e_renato/migration.sql", "utf8");
    await db.exec(sql); await db.exec(sql);
    const rows = (await db.query<{slug: string; active: boolean; price: number | null; editoraId: string; coverUrl: string}>('SELECT "slug", "active", "price", "editoraId", "coverUrl" FROM "Book"')).rows;
    assert.equal(rows.length, 13);
    const existing = rows.find(b => b.slug === "educacao-visual-e-oficios-6a-classe")!;
    assert.equal(existing.active, false); assert.equal(existing.price, 650);
    assert.equal(existing.coverUrl, "/covers/educacao-visual-e-oficios-6a-classe.jpg");
    assert.equal(rows.find(b => b.slug === "major-general-mariano-matsinha")!.editoraId, "autor");
    for (const row of rows.filter(b => b !== existing)) assert.equal(row.price, null);
  } finally { await db.close(); }
});
