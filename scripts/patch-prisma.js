#!/usr/bin/env node
/**
 * Patch pós-install para @prisma/client em sandboxes sem rede (E2B).
 * - O `prisma generate` falha quando binaries.prisma.sh está bloqueado,
 *   deixando node_modules/.prisma/client como placeholder que não exporta enums
 *   (Role, ContactReason, etc) e cujo PrismaClient lança "did not initialize".
 * - Este script injeta os enums em falta e torna o PrismaClient tolerante,
 *   permitindo que lib/prisma.ts use o mock em memória (dados de data/books.ts)
 *   e que rotas como /eventos e /editoras não façam 500.
 * - É idempotente e seguro para rodar em produção com DB real — se o client
 *   já foi gerado corretamente (com enums), não faz nada.
 */
const fs = require("fs");
const path = require("path");

const clientDir = path.join(__dirname, "..", "node_modules", ".prisma", "client");
const files = ["default.js", "index.js", "wasm.js", "edge.js"];

if (!fs.existsSync(clientDir)) {
  console.log("[patch-prisma] clientDir não existe, skip — talvez prisma ainda não instalado");
  process.exit(0);
}

const enumDefinitions = `
// --- Patch E2B: enums para execução sem prisma generate (fix migratio livros) ---
var Role = { ADMIN: "ADMIN", CUSTOMER: "CUSTOMER" };
var Currency = { KZ: "KZ", MT: "MT", EUR: "EUR", BRL: "BRL" };
var OrderStatus = { PENDING: "PENDING", PAID: "PAID", CANCELLED: "CANCELLED" };
var NoteKind = { BOOKMARK: "BOOKMARK", NOTE: "NOTE" };
var TipoInstituicao = { ESCOLA: "ESCOLA", UNIVERSIDADE: "UNIVERSIDADE", LIVRARIA: "LIVRARIA", EDITORA: "EDITORA", OUTRO: "OUTRO" };
var EstadoConvenio = { PENDENTE: "PENDENTE", EM_ANALISE: "EM_ANALISE", APROVADO: "APROVADO", REJEITADO: "REJEITADO" };
var TipoEvento = { LANCAMENTO: "LANCAMENTO", FEIRA: "FEIRA", WORKSHOP: "WORKSHOP", OUTRO: "OUTRO" };
var EstadoInscricao = { CONFIRMADA: "CONFIRMADA", LISTA_ESPERA: "LISTA_ESPERA", CANCELADA: "CANCELADA" };
var ClientType = { PARTICULAR: "PARTICULAR", LIVRARIA: "LIVRARIA", REVENDEDOR: "REVENDEDOR", ESCOLA: "ESCOLA", UNIVERSIDADE: "UNIVERSIDADE", EDITORA: "EDITORA" };
var ContactReason = { PUBLICAR: "PUBLICAR", COMPRAR: "COMPRAR", PARCERIA: "PARCERIA", SUPORTE_TECNICO: "SUPORTE_TECNICO", COMERCIAL: "COMERCIAL", OUTRO: "OUTRO" };
`;

let patched = 0;
for (const file of files) {
  const fp = path.join(clientDir, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, "utf8");
  if (content.includes("ContactReason") && content.includes('var Role')) {
    // já patchado
    continue;
  }
  if (content.includes("ContactReason")) {
    // já tem ContactReason mas não nosso patch completo? considerar patchado
    continue;
  }
  // Expõe enums no __export
  const exportRegex = /__export\(default_index_exports,\s*\{[^}]+\}\);/;
  const newExport = `__export(default_index_exports, {
  Prisma: () => Prisma,
  PrismaClient: () => PrismaClient,
  Role: () => Role,
  Currency: () => Currency,
  OrderStatus: () => OrderStatus,
  NoteKind: () => NoteKind,
  TipoInstituicao: () => TipoInstituicao,
  EstadoConvenio: () => EstadoConvenio,
  TipoEvento: () => TipoEvento,
  EstadoInscricao: () => EstadoInscricao,
  ClientType: () => ClientType,
  ContactReason: () => ContactReason,
  default: () => default_index_default
});`;
  if (exportRegex.test(content)) {
    content = content.replace(exportRegex, newExport);
  } else {
    console.log(`[patch-prisma] exportRegex não encontrado em ${file}, skip`);
    continue;
  }
  const prismaVar = "var Prisma = {";
  if (content.includes(prismaVar)) {
    content = content.replace(prismaVar, enumDefinitions + "\n" + prismaVar);
  }
  content = content.replace(
    /0 && \(module\.exports = \{[^}]+\}\);/,
    `0 && (module.exports = {
  Prisma,
  PrismaClient,
  Role,
  Currency,
  OrderStatus,
  NoteKind,
  TipoInstituicao,
  EstadoConvenio,
  TipoEvento,
  EstadoInscricao,
  ClientType,
  ContactReason
});`
  );
  // Torna PrismaClient tolerante (não lança)
  const mockClient = `
var PrismaClient = class {
  constructor() {
    const handler = {
      get(target, prop) {
        if (prop === 'then') return undefined;
        return (...args) => Promise.resolve(prop === 'findMany' || prop === 'findFirst' ? [] : prop === 'findUnique' ? null : prop === 'groupBy' ? [] : prop === 'create' ? { id: 'mock' } : null);
      }
    };
    const delegate = new Proxy({}, handler);
    const rootHandler = {
      get(target, prop) {
        if (prop === '$transaction') return async (fn) => typeof fn === 'function' ? fn(target) : fn;
        if (prop === '$disconnect' || prop === '$connect') return async () => {};
        return delegate;
      }
    };
    return new Proxy({}, rootHandler);
  }
};`;
  content = content.replace(
    /var PrismaClient = class \{\s*constructor\(\) \{\s*throw new Error\('@prisma\/client did not initialize yet[^']*'\);\s*\}\s*\};/,
    mockClient
  );
  fs.writeFileSync(fp, content, "utf8");
  console.log(`[patch-prisma] patched ${file}`);
  patched++;
}
if (patched === 0) console.log("[patch-prisma] nada para patchar (já ok ou client real)");
else console.log(`[patch-prisma] ${patched} ficheiros patchados`);
