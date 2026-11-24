import { test } from "node:test";
import assert from "node:assert/strict";
import { schoolBooksForCategory } from "../lib/categories";

test("subcategorias escolares selecionam o nível em vez de depender da associação vazia", () => {
  const books = [
    { slug: "primario", educationLevel: "ENSINO_PRIMARIO" },
    { slug: "secundario", educationLevel: "ENSINO_SECUNDARIO" },
  ];
  assert.deepEqual(schoolBooksForCategory("ensino-primario", books), [books[0]]);
  assert.deepEqual(schoolBooksForCategory("ensino-secundario", books), [books[1]]);
  assert.deepEqual(schoolBooksForCategory("ensino-superior", books), []);
  assert.equal(schoolBooksForCategory("escolar", books), undefined);
});
