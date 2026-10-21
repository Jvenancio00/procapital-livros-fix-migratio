import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { validateAndNormalizeIsbn } from "@/lib/isbn";
import { currencyForMarket, resolveCountryInput } from "@/lib/markets";
import type { Currency, EducationLevel, MarketCode } from "@/lib/enums";

export interface ImportActionSelection {
  updateStock: boolean;
  updatePrices: boolean;
  importNewBooks: boolean;
}

export interface ParsedImportRow {
  rowNumber: number;
  rawIsbn: string;
  isbnNormalized: string | null;
  isbnKind: string;
  title: string;
  author: string;
  editora: string;
  category: string;
  countryCode: MarketCode | null;
  currency: Currency | null;
  warehouseCode: string;
  quantity: number | null;
  price: number | null;
  educationLevel: EducationLevel | null;
  schoolGrade: string;
  subject: string;
  academicYear: number | null;
  matchedBookId: string | null;
  matchedBookSlug: string | null;
  matchedBookTitle: string | null;
  status: "MATCHED" | "NEW_BOOK" | "UNMATCHED" | "DUPLICATE_IN_FILE" | "ERROR";
  proposedChanges: string[];
  warnings: string[];
  errors: string[];
}

export interface ImportPreviewSummary {
  filename: string;
  columnsDetected: string[];
  totalRows: number;
  validRows: number;
  matchedExisting: number;
  newBooksCount: number;
  unmatchedCount: number;
  duplicateCount: number;
  errorCount: number;
  proposedStockUpdates: number;
  proposedPriceUpdates: number;
  rows: ParsedImportRow[];
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 75);
}

function normalizeHeaderKey(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function pickField(record: Record<string, unknown>, aliases: string[]): string {
  for (const [k, v] of Object.entries(record)) {
    const norm = normalizeHeaderKey(k);
    if (aliases.includes(norm) && v !== undefined && v !== null) {
      return String(v).trim();
    }
  }
  return "";
}

function parseNumberField(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function resolveCurrencyInput(raw: string, fallbackCountry: MarketCode | null): Currency | null {
  const v = raw.trim().toUpperCase();
  if (v === "KZ" || v === "AOA" || v === "KWANZA" || v === "KWANZAS") return "KZ";
  if (v === "MT" || v === "MZN" || v === "METICAL" || v === "METICAIS") return "MT";
  if (v === "EUR" || v === "€" || v === "EURO") return "EUR";
  if (v === "BRL" || v === "R$" || v === "REAL" || v === "REAIS") return "BRL";
  if (!v && fallbackCountry) return currencyForMarket(fallbackCountry);
  return null;
}

function resolveEducationLevel(raw: string, category: string): EducationLevel | null {
  const v = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (v.includes("primar")) return "ENSINO_PRIMARIO";
  if (v.includes("secund")) return "ENSINO_SECUNDARIO";
  if (v.includes("tecnic") || v.includes("profiss")) return "TECNICO_PROFISSIONAL";
  if (v.includes("super") || v.includes("univers")) return "ENSINO_SUPERIOR";
  if (category.toLowerCase() === "escolar") return "ENSINO_PRIMARIO";
  return null;
}

export function parseSpreadsheetBuffer(buffer: Buffer, filename: string): {
  columns: string[];
  rawRows: Record<string, unknown>[];
} {
  const isCsv = filename.toLowerCase().endsWith(".csv");
  let workbook: XLSX.WorkBook;
  if (isCsv) {
    const text = buffer.toString("utf8").replace(/^\uFEFF/, "");
    workbook = XLSX.read(text, { type: "string", raw: false });
  } else {
    workbook = XLSX.read(buffer, { type: "buffer", raw: false });
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { columns: [], rawRows: [] };
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const columns =
    rawRows.length > 0 ? Object.keys(rawRows[0]).map((c) => c.trim()).filter(Boolean) : [];
  return { columns, rawRows };
}

export async function analyzeImportSpreadsheet(
  buffer: Buffer,
  filename: string,
  actions: ImportActionSelection
): Promise<ImportPreviewSummary> {
  const { columns, rawRows } = parseSpreadsheetBuffer(buffer, filename);

  const [existingBooks, warehouses] = await Promise.all([
    prisma.book.findMany({
      select: { id: true, slug: true, title: true, isbn: true, isbnNormalized: true },
    }),
    prisma.warehouse.findMany({
      where: { active: true },
      orderBy: [{ isPrimary: "desc" }, { code: "asc" }],
    }),
  ]);

  const byIsbn = new Map<string, (typeof existingBooks)[number]>();
  const byTitleLower = new Map<string, (typeof existingBooks)[number]>();
  for (const b of existingBooks) {
    if (b.isbnNormalized) byIsbn.set(b.isbnNormalized, b);
    byTitleLower.set(b.title.trim().toLowerCase(), b);
  }

  const seenKeysInFile = new Set<string>();
  const rows: ParsedImportRow[] = [];

  for (let idx = 0; idx < rawRows.length; idx += 1) {
    const raw = rawRows[idx];
    const rowNumber = idx + 2; // Linha 1 é cabeçalho

    const rawIsbn = pickField(raw, ["isbn", "isbn13", "isbn10", "codigoisbn", "ean"]);
    const title = pickField(raw, ["titulo", "title", "livro", "nome", "obra"]);
    const author = pickField(raw, ["autor", "author", "autores"]);
    const editora = pickField(raw, ["editora", "publisher", "chancela"]);
    const category = pickField(raw, ["categoria", "category", "genero"]) || "Escolar";
    const rawCountry = pickField(raw, ["pais", "country", "mercado", "market"]);
    const rawCurrency = pickField(raw, ["moeda", "currency"]);
    const rawWarehouse = pickField(raw, ["armazem", "warehouse", "deposito", "codigoarmazem"]);
    const rawQty = pickField(raw, ["quantidade", "stock", "qtd", "qty", "unidades"]);
    const rawPrice = pickField(raw, ["preco", "price", "valor", "precounitario", "pvp"]);
    const rawLevel = pickField(raw, ["nivel", "nivelensino", "educationlevel", "ciclo"]);
    const schoolGrade = pickField(raw, ["classe", "anoescolar", "grade"]);
    const subject = pickField(raw, ["disciplina", "subject", "materia"]);
    const rawYear = pickField(raw, ["anoletivo", "ano", "year", "edicao"]);

    const errors: string[] = [];
    const warnings: string[] = [];
    const proposedChanges: string[] = [];

    const isbnCheck = validateAndNormalizeIsbn(rawIsbn, { strictChecksum: true });
    // Se tiver 13 dígitos não-padrão mas já existir na BD, aceita com aviso
    const relaxedNorm = validateAndNormalizeIsbn(rawIsbn, { strictChecksum: false });
    let isbnNormalized = isbnCheck.normalized;
    if (!isbnCheck.valid && relaxedNorm.normalized && byIsbn.has(relaxedNorm.normalized)) {
      isbnNormalized = relaxedNorm.normalized;
      if (relaxedNorm.warning) warnings.push(relaxedNorm.warning);
    } else if (!isbnCheck.valid && rawIsbn) {
      errors.push(isbnCheck.warning ?? "ISBN inválido.");
    }

    const countryCode = rawCountry ? resolveCountryInput(rawCountry) : "MZ";
    if (rawCountry && !countryCode) {
      errors.push(`País/mercado inválido: "${rawCountry}" (use Angola, Moçambique, Portugal ou Brasil).`);
    }

    const currency = resolveCurrencyInput(rawCurrency, countryCode);
    if (rawCurrency && !currency) {
      errors.push(`Moeda inválida: "${rawCurrency}" (use KZ/AOA, MT/MZN, EUR ou BRL).`);
    }

    const quantity = parseNumberField(rawQty);
    if (rawQty && (quantity === null || Number.isNaN(quantity) || !Number.isInteger(quantity) || quantity < 0)) {
      errors.push(`Quantidade inválida: "${rawQty}" (deve ser inteiro >= 0).`);
    }

    const price = parseNumberField(rawPrice);
    if (rawPrice && (price === null || Number.isNaN(price) || price < 0)) {
      errors.push(`Preço inválido: "${rawPrice}" (deve ser numérico >= 0).`);
    }

    const academicYear = rawYear ? Number(rawYear) : null;
    if (rawYear && (!Number.isInteger(academicYear) || (academicYear ?? 0) < 1900 || (academicYear ?? 0) > 2100)) {
      errors.push(`Ano inválido: "${rawYear}".`);
    }

    // Resolve armazém
    const matchedWarehouse = rawWarehouse
      ? warehouses.find(
          (w) =>
            w.code.toLowerCase() === rawWarehouse.toLowerCase() ||
            w.name.toLowerCase() === rawWarehouse.toLowerCase()
        )
      : warehouses.find((w) => w.countryCode === (countryCode ?? "MZ"));

    if (rawWarehouse && !matchedWarehouse) {
      errors.push(`Armazém "${rawWarehouse}" não encontrado.`);
    }
    const warehouseCode = matchedWarehouse?.code ?? "MZ-MPM-01";

    // Correspondência prioritária por ISBN normalizado
    const matchedBook = isbnNormalized
      ? byIsbn.get(isbnNormalized) ?? null
      : title
      ? byTitleLower.get(title.toLowerCase()) ?? null
      : null;

    if (!isbnNormalized && matchedBook) {
      warnings.push("Correspondência feita pelo título (ISBN não indicado na linha).");
    }

    // Deteção de duplicação dentro do mesmo ficheiro
    const dedupeKey = `${isbnNormalized || title.toLowerCase()}::${warehouseCode}::${currency ?? ""}`;
    const isDuplicate = Boolean(isbnNormalized || title) && seenKeysInFile.has(dedupeKey);
    if (isbnNormalized || title) {
      seenKeysInFile.add(dedupeKey);
    }

    let status: ParsedImportRow["status"] = "MATCHED";
    if (errors.length > 0) {
      status = "ERROR";
    } else if (isDuplicate) {
      status = "DUPLICATE_IN_FILE";
      warnings.push("Registo duplicado no ficheiro para o mesmo livro, armazém e moeda.");
    } else if (matchedBook) {
      status = "MATCHED";
      if (actions.updateStock && quantity !== null && !Number.isNaN(quantity)) {
        proposedChanges.push(`Atualizar stock em ${warehouseCode} → ${quantity} un.`);
      }
      if (actions.updatePrices && price !== null && !Number.isNaN(price) && currency) {
        proposedChanges.push(`Atualizar preço (${currency}) → ${price}`);
      }
      if (proposedChanges.length === 0) {
        warnings.push("Nenhuma alteração selecionada aplicável a esta linha.");
      }
    } else if (actions.importNewBooks) {
      if (!title || !author || !editora) {
        status = "ERROR";
        errors.push("Para importar um livro novo são obrigatórios Título, Autor e Editora.");
      } else {
        status = "NEW_BOOK";
        proposedChanges.push(`Importar novo livro "${title}" (${editora})`);
        if (actions.updateStock && quantity !== null) {
          proposedChanges.push(`Stock inicial em ${warehouseCode}: ${quantity} un.`);
        }
        if (actions.updatePrices && price !== null && currency) {
          proposedChanges.push(`Preço inicial (${currency}): ${price}`);
        }
      }
    } else {
      status = "UNMATCHED";
      warnings.push(
        "Livro não encontrado por ISBN/título e a opção 'Importar novos livros' está desativada."
      );
    }

    rows.push({
      rowNumber,
      rawIsbn,
      isbnNormalized,
      isbnKind: isbnCheck.kind,
      title,
      author,
      editora,
      category,
      countryCode,
      currency,
      warehouseCode,
      quantity: quantity !== null && !Number.isNaN(quantity) ? quantity : null,
      price: price !== null && !Number.isNaN(price) ? price : null,
      educationLevel: resolveEducationLevel(rawLevel, category),
      schoolGrade,
      subject,
      academicYear: academicYear && Number.isInteger(academicYear) ? academicYear : null,
      matchedBookId: matchedBook?.id ?? null,
      matchedBookSlug: matchedBook?.slug ?? null,
      matchedBookTitle: matchedBook?.title ?? null,
      status,
      proposedChanges,
      warnings,
      errors,
    });
  }

  return {
    filename,
    columnsDetected: columns,
    totalRows: rows.length,
    validRows: rows.filter((r) => r.status === "MATCHED" || r.status === "NEW_BOOK").length,
    matchedExisting: rows.filter((r) => r.status === "MATCHED").length,
    newBooksCount: rows.filter((r) => r.status === "NEW_BOOK").length,
    unmatchedCount: rows.filter((r) => r.status === "UNMATCHED").length,
    duplicateCount: rows.filter((r) => r.status === "DUPLICATE_IN_FILE").length,
    errorCount: rows.filter((r) => r.status === "ERROR").length,
    proposedStockUpdates: rows.filter(
      (r) =>
        (r.status === "MATCHED" || r.status === "NEW_BOOK") &&
        actions.updateStock &&
        r.quantity !== null
    ).length,
    proposedPriceUpdates: rows.filter(
      (r) =>
        (r.status === "MATCHED" || r.status === "NEW_BOOK") &&
        actions.updatePrices &&
        r.price !== null &&
        Boolean(r.currency)
    ).length,
    rows,
  };
}

export async function commitImportSpreadsheet(params: {
  buffer: Buffer;
  filename: string;
  actions: ImportActionSelection;
  actorId: string;
  actorEmail: string;
}) {
  const preview = await analyzeImportSpreadsheet(
    params.buffer,
    params.filename,
    params.actions
  );

  let createdBooks = 0;
  let updatedStock = 0;
  let updatedPrices = 0;
  let skippedRows = 0;
  const rowResults: {
    rowNumber: number;
    isbn: string;
    title: string;
    outcome: "SUCCESS" | "SKIPPED" | "ERROR";
    details: string;
  }[] = [];

  const mode =
    params.actions.updateStock && !params.actions.updatePrices && !params.actions.importNewBooks
      ? "UPDATE_STOCK"
      : !params.actions.updateStock && params.actions.updatePrices && !params.actions.importNewBooks
      ? "UPDATE_PRICES"
      : !params.actions.updateStock && !params.actions.updatePrices && params.actions.importNewBooks
      ? "IMPORT_BOOKS"
      : "COMBINED";

  const batch = await prisma.importBatch.create({
    data: {
      filename: params.filename,
      mode,
      status: "PROCESSING",
      selectedActions: params.actions as object,
      totalRows: preview.totalRows,
      validRows: preview.validRows,
      errorRows: preview.errorCount,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
    },
  });

  const categories = await prisma.category.findMany();
  const defaultCategory =
    categories.find((c) => c.slug === "escolar") ?? categories[0];
  const warehouses = await prisma.warehouse.findMany();

  for (const row of preview.rows) {
    if (row.status === "ERROR") {
      rowResults.push({
        rowNumber: row.rowNumber,
        isbn: row.rawIsbn,
        title: row.title,
        outcome: "ERROR",
        details: row.errors.join("; "),
      });
      continue;
    }

    if (row.status === "UNMATCHED" || row.status === "DUPLICATE_IN_FILE") {
      skippedRows += 1;
      rowResults.push({
        rowNumber: row.rowNumber,
        isbn: row.rawIsbn,
        title: row.title,
        outcome: "SKIPPED",
        details: row.warnings.join("; "),
      });
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        let bookId = row.matchedBookId;

        if (!bookId && row.status === "NEW_BOOK" && params.actions.importNewBooks) {
          const catMatch =
            categories.find(
              (c) => c.name.toLowerCase() === row.category.toLowerCase()
            ) ?? defaultCategory;

          const editoraSlug = slugify(row.editora || "editora-parceira");
          const editoraRec = await tx.editora.upsert({
            where: { slug: editoraSlug },
            update: {},
            create: {
              slug: editoraSlug,
              name: row.editora,
              country:
                row.countryCode === "AO"
                  ? "Angola"
                  : row.countryCode === "PT"
                  ? "Portugal"
                  : row.countryCode === "BR"
                  ? "Brasil"
                  : "Moçambique",
            },
          });

          const baseSlug = slugify(row.title) || `livro-${Date.now()}`;
          const existingSlug = await tx.book.findUnique({ where: { slug: baseSlug } });
          const finalSlug = existingSlug
            ? `${baseSlug}-${(row.isbnNormalized ?? String(Date.now())).slice(-5)}`
            : baseSlug;

          const created = await tx.book.create({
            data: {
              slug: finalSlug,
              title: row.title,
              author: row.author,
              editora: row.editora,
              editoraId: editoraRec.id,
              categoryId: catMatch.id,
              isbn: row.rawIsbn || row.isbnNormalized,
              isbnNormalized: row.isbnNormalized,
              educationLevel: row.educationLevel,
              schoolGrade: row.schoolGrade || null,
              subject: row.subject || null,
              academicYear: row.academicYear,
              year: row.academicYear,
              allowQuote: true,
            },
          });
          bookId = created.id;
          createdBooks += 1;
        }

        if (!bookId) {
          skippedRows += 1;
          return;
        }

        if (params.actions.updatePrices && row.price !== null && row.currency) {
          await tx.price.upsert({
            where: { bookId_currency: { bookId, currency: row.currency } },
            update: { amount: row.price, marketActive: true },
            create: { bookId, currency: row.currency, amount: row.price, marketActive: true },
          });
          updatedPrices += 1;
        }

        if (params.actions.updateStock && row.quantity !== null) {
          const wh =
            warehouses.find((w) => w.code === row.warehouseCode) ?? warehouses[0];
          const existingStock = await tx.stockItem.findUnique({
            where: { bookId_warehouseId: { bookId, warehouseId: wh.id } },
          });
          const previousQty = existingStock?.quantity ?? 0;
          const stockSaved = await tx.stockItem.upsert({
            where: { bookId_warehouseId: { bookId, warehouseId: wh.id } },
            update: { quantity: row.quantity },
            create: {
              bookId,
              warehouseId: wh.id,
              quantity: row.quantity,
              reserved: 0,
            },
          });
          await tx.stockMovement.create({
            data: {
              stockItemId: stockSaved.id,
              type: "IMPORT_IN",
              delta: row.quantity - previousQty,
              previousQty,
              newQty: row.quantity,
              reason: `Importação Excel/CSV (${params.filename}, linha ${row.rowNumber})`,
              actorId: params.actorId,
              actorEmail: params.actorEmail,
              importBatchId: batch.id,
            },
          });
          updatedStock += 1;
        }
      });

      rowResults.push({
        rowNumber: row.rowNumber,
        isbn: row.rawIsbn,
        title: row.title || row.matchedBookTitle || "",
        outcome: "SUCCESS",
        details: row.proposedChanges.join(" | "),
      });
    } catch (err) {
      rowResults.push({
        rowNumber: row.rowNumber,
        isbn: row.rawIsbn,
        title: row.title,
        outcome: "ERROR",
        details: err instanceof Error ? err.message : "Erro ao gravar linha.",
      });
    }
  }

  const finalErrorCount = rowResults.filter((r) => r.outcome === "ERROR").length;
  const completedBatch = await prisma.importBatch.update({
    where: { id: batch.id },
    data: {
      status: finalErrorCount > 0 && createdBooks + updatedStock + updatedPrices === 0 ? "FAILED" : "COMPLETED",
      createdBooks,
      updatedStock,
      updatedPrices,
      skippedRows,
      errorRows: finalErrorCount,
      summaryJson: {
        createdBooks,
        updatedStock,
        updatedPrices,
        skippedRows,
        errorRows: finalErrorCount,
      },
      reportJson: rowResults,
    },
  });

  return {
    batchId: completedBatch.id,
    status: completedBatch.status,
    createdBooks,
    updatedStock,
    updatedPrices,
    skippedRows,
    errorRows: finalErrorCount,
    results: rowResults,
  };
}
