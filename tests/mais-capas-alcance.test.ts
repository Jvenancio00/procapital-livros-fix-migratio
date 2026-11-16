import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { BOOKS } from "../data/books";
import { filterAndSortBooks } from "../lib/catalog";

const slugs = [
  "os-pastores-de-letras",
  "zua-e-mwedzi-vao-a-caca-das-palavras",
  "a-riqueza-de-ser-diferente",
  "cada-pessoa-e-uma-cor",
  "dicionario-dictionary-portugues-ingles",
  "dicionario-portugues-ingles-english-portuguese",
  "gramatica-da-lingua-portuguesa-2-ciclo",
  "o-meu-primeiro-livro-de-gramatica",
  "didactique-du-francais-langue-etrangere",
  "didactics-of-english-language",
  "didactica-de-quimica",
  "didactica-de-portugues",
  "didactica-de-matematica",
  "didactica-de-lingua-materna",
  "didactica-de-geografia",
  "100-acordaos-da-jurisdicao-administrativa",
  "principal-legislacao-de-proteccao-dos-direitos-da-crianca-e-da-mulher",
  "principal-legislacao-financeira-e-avisos-do-banco-de-mocambique",
  "principal-legislacao-sobre-descentralizacao-em-mocambique"
];

test("20 capas Alcance correspondem aos títulos do catálogo", () => {
  assert.equal(slugs.length, 19);
  for (const slug of [...slugs, "educacao-visual-e-oficios-5a-classe"]) {
    const matches = BOOKS.filter(b => b.slug === slug);
    assert.equal(matches.length, 1, slug);
    const b = matches[0];
    assert.equal(b.editora, "Alcance Editores");
    assert.equal(b.coverUrl, `/covers/${slug}.jpg`);
    assert.ok(existsSync(`public${b.coverUrl}`));
    if (slug !== "educacao-visual-e-oficios-5a-classe") {
      assert.deepEqual([b.price, b.priceKZ, b.priceEUR, b.priceBRL], [0, 0, 0, 0]);
      assert.deepEqual(b.stockByMarket, {});
      assert.equal(filterAndSortBooks([b], {country: "MZ"}).items.length, 1);
    }
  }
});

test("migração idempotente conserva dados de títulos existentes", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE TABLE "Category" ("id" text primary key, "slug" text unique, "name" text unique);
      CREATE TABLE "Editora" ("id" text primary key, "slug" text unique);
      CREATE TABLE "Book" ("id" text primary key, "slug" text unique, "title" text, "author" text, "editora" text, "editoraId" text, "categoryId" text, "coverUrl" text, "countryOrigin" text, "allowQuote" boolean, "updatedAt" timestamp, "active" boolean default true, "price" integer);
      INSERT INTO "Editora" VALUES ('ed', 'alcance-editores');
      INSERT INTO "Book" ("id", "slug", "title", "author", "editora", "active", "price") VALUES
        ('existing', 'os-pastores-de-letras', 'Título existente', 'Autor existente', 'Alcance Editores', false, 123),
        ('school', 'educacao-visual-e-oficios-5a-classe', 'Manual existente', 'Autores', 'Alcance Editores', true, 650);
    `);
    const sql = readFileSync("prisma/migrations/20261116130000_mais_capas_alcance/migration.sql", "utf8");
    await db.exec(sql); await db.exec(sql);
    const rows = (await db.query<{slug: string; title: string; active: boolean; price: number | null; coverUrl: string; editoraId: string | null}>('SELECT "slug", "title", "active", "price", "coverUrl", "editoraId" FROM "Book"')).rows;
    assert.equal(rows.length, 20);
    const existing = rows.find(b => b.slug === "os-pastores-de-letras")!;
    assert.equal(existing.title, "Título existente"); assert.equal(existing.active, false); assert.equal(existing.price, 123);
    assert.equal(existing.coverUrl, "/covers/os-pastores-de-letras.jpg");
    const school = rows.find(b => b.slug === "educacao-visual-e-oficios-5a-classe")!;
    assert.equal(school.price, 650); assert.equal(school.coverUrl, "/covers/educacao-visual-e-oficios-5a-classe.jpg");
    for (const b of rows.filter(b => b.slug !== existing.slug && b.slug !== school.slug)) {
      assert.equal(b.price, null); assert.equal(b.editoraId, "ed"); assert.equal(b.coverUrl, `/covers/${b.slug}.jpg`);
    }
  } finally { await db.close(); }
});
