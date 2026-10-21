import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import * as XLSX from "xlsx";
import { prisma } from "../lib/prisma";
import {
  isbn10ToIsbn13,
  parseIsbn,
  validateAndNormalizeIsbn,
} from "../lib/isbn";
import { filterAndSortBooks, getAllCatalogBooks } from "../lib/catalog";
import {
  analyzeImportSpreadsheet,
  commitImportSpreadsheet,
} from "../lib/excel-import";
import {
  commitOrderStockOnPaymentInTx,
  releaseExpiredReservations,
  releaseOrRefundOrderStockInTx,
  reserveOrderStockInTx,
} from "../lib/stock";
import {
  getAvailablePaymentMethodsForMarket,
  verifyPaymentWebhookSignature,
} from "../lib/payments";
import {
  isValidEmailAddress,
  sendTransactionalEmail,
} from "../lib/email";
import { generateCatalogPdfBuffer } from "../lib/pdf-catalog";
import { generateOrderCommercialPdf } from "../lib/pdf-invoice";

describe("Pro Capital — Plataforma Editorial & Comércio B2B (Testes Reais PostgreSQL)", () => {
  after(async () => {
    await prisma.$disconnect();
  });

  it("1. Normaliza ISBN-10 / ISBN-13 e valida dígito de controlo", () => {
    const valid13 = validateAndNormalizeIsbn("978-972-21-2634-2", {
      strictChecksum: true,
    });
    assert.equal(valid13.valid, true);
    assert.equal(valid13.normalized, "9789722126342");

    // ISBN-10 válido: 0-306-40615-2 -> 9780306406157
    const converted = isbn10ToIsbn13("0-306-40615-2");
    assert.equal(converted, "9780306406157");

    const invalid13 = validateAndNormalizeIsbn("978-972-21-2634-9", {
      strictChecksum: true,
    });
    assert.equal(invalid13.valid, false);

    const parsed = parseIsbn("978-972-21-2634-2");
    assert.equal(parsed.isCompleteLength, true);
    assert.equal(parsed.valid, true);
  });

  it("2. Pesquisa prioritária por ISBN e filtros escolares sobre dados reais PostgreSQL", async () => {
    const books = await getAllCatalogBooks();
    assert.ok(books.length >= 40, "Catálogo semeado deve ter pelo menos 40 livros reais");

    const targetWithIsbn = books.find((b) => Boolean(b.isbn));
    assert.ok(targetWithIsbn, "Deve existir livro com ISBN real");

    const byIsbn = filterAndSortBooks(books, {
      query: targetWithIsbn.isbn!,
      country: "MZ",
      currency: "MT",
    });
    assert.ok(byIsbn.items.length >= 1);
    assert.equal(byIsbn.items[0].slug, targetWithIsbn.slug);
    assert.equal(byIsbn.isbnPriorityApplied, true);

    const schoolBooks = filterAndSortBooks(books, {
      category: "Escolar",
      country: "MZ",
      currency: "MT",
    });
    assert.ok(schoolBooks.items.length > 0, "Deve retornar manuais escolares reais");
  });

  it("3. Importação Excel (.xlsx): pré-visualização sem escrita prévia, deteção de duplicados/erros e execução controlada", async () => {
    const existingBook = await prisma.book.findFirstOrThrow({
      where: { isbnNormalized: { not: null } },
    });

    const uniqueIsbn12 = "978989999888";
    let sum = 0;
    for (let i = 0; i < 12; i += 1) {
      sum += i % 2 === 0 ? Number(uniqueIsbn12[i]) : Number(uniqueIsbn12[i]) * 3;
    }
    const validNewIsbn = `${uniqueIsbn12}${(10 - (sum % 10)) % 10}`;

    // Limpeza preventiva caso o ISBN de teste já exista
    await prisma.book.deleteMany({ where: { isbnNormalized: validNewIsbn } });

    const rows = [
      {
        ISBN: existingBook.isbnNormalized,
        Título: existingBook.title,
        Autor: existingBook.author,
        Editora: existingBook.editora,
        Categoria: "Escolar",
        País: "Moçambique",
        Moeda: "MT",
        Armazém: "MZ-MPM-01",
        Quantidade: 77,
        Preço: 1150,
      },
      {
        ISBN: validNewIsbn,
        Título: "Manual Experimental de Teste Automatizado",
        Autor: "Equipa Editorial Teste",
        Editora: "Plural Editores",
        Categoria: "Escolar",
        País: "Angola",
        Moeda: "KZ",
        Armazém: "AO-LAD-01",
        Quantidade: 45,
        Preço: 8400,
        Nível: "ENSINO_SECUNDARIO",
        Classe: "10ª Classe",
        Disciplina: "Matemática",
      },
      {
        // Duplicado no mesmo ficheiro
        ISBN: validNewIsbn,
        Título: "Duplicado no mesmo Excel",
        Autor: "Equipa Editorial Teste",
        Editora: "Plural Editores",
        Categoria: "Escolar",
        País: "Angola",
        Moeda: "KZ",
        Quantidade: 10,
        Preço: 8400,
      },
      {
        // Quantidade negativa -> erro validado
        ISBN: "9789720000002",
        Título: "Linha Inválida",
        Autor: "Autor",
        Editora: "Editora",
        Quantidade: -15,
        Preço: 500,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const preview = await analyzeImportSpreadsheet(buffer, "teste-stock.xlsx", {
      updateStock: true,
      updatePrices: true,
      importNewBooks: true,
    });

    assert.equal(preview.totalRows, 4);
    assert.equal(preview.matchedExisting, 1);
    assert.equal(preview.newBooksCount, 1);
    assert.equal(preview.duplicateCount, 1);
    assert.equal(preview.errorCount, 1);

    // Garante que a pré-visualização NÃO gravou o novo livro antes da confirmação!
    const beforeCommit = await prisma.book.findUnique({
      where: { isbnNormalized: validNewIsbn },
    });
    assert.equal(beforeCommit, null);

    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { email: "admin@procapitalmz.com" },
    });

    // Executa confirmação real na BD PostgreSQL
    const committed = await commitImportSpreadsheet({
      buffer,
      filename: "teste-stock.xlsx",
      actions: {
        updateStock: true,
        updatePrices: true,
        importNewBooks: true,
      },
      actorId: adminUser.id,
      actorEmail: adminUser.email,
    });

    assert.equal(committed.createdBooks, 1);
    assert.ok(committed.updatedStock >= 2);
    assert.ok(committed.updatedPrices >= 2);

    const createdBook = await prisma.book.findUnique({
      where: { isbnNormalized: validNewIsbn },
      include: { prices: true, stockItems: true },
    });
    assert.ok(createdBook, "Novo livro deve existir em PostgreSQL após commit");
    assert.equal(createdBook.stockItems[0]?.quantity, 45);

    // Limpa registo criado pelo teste para não poluir o catálogo real
    await prisma.importBatch.delete({ where: { id: committed.batchId } });
    await prisma.book.delete({ where: { id: createdBook.id } });
  });

  it("4. Controlo atómico de stock: reserva, bloqueio de oversell concorrente, expiração, confirmação de pagamento e reembolso", async () => {
    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { email: "admin@procapitalmz.com" },
    });
    const category = await prisma.category.findFirstOrThrow();
    const warehouse = await prisma.warehouse.findFirstOrThrow({
      where: { countryCode: "MZ", active: true },
    });

    const tempBook = await prisma.book.create({
      data: {
        slug: `teste-concorrencia-${Date.now()}`,
        title: "Livro Teste Controlo Atómico Stock",
        author: "Autor Teste",
        editora: "Pro Capital",
        categoryId: category.id,
        allowPreorder: false,
      },
    });

    const stockItem = await prisma.stockItem.create({
      data: {
        bookId: tempBook.id,
        warehouseId: warehouse.id,
        quantity: 5,
        reserved: 0,
        lowStockThreshold: 2,
      },
    });

    const order1 = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORD-${Date.now()}-A`,
        userId: adminUser.id,
        status: "AWAITING_PAYMENT",
        currency: "MT",
        countryCode: "MZ",
        totalAmount: 1500,
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: `TEST-ORD-${Date.now()}-B`,
        userId: adminUser.id,
        status: "AWAITING_PAYMENT",
        currency: "MT",
        countryCode: "MZ",
        totalAmount: 2000,
      },
    });

    // Reserva 3 das 5 unidades disponíveis
    await prisma.$transaction((tx) =>
      reserveOrderStockInTx(tx, {
        orderId: order1.id,
        orderNumber: order1.orderNumber!,
        countryCode: "MZ",
        items: [
          {
            bookId: tempBook.id,
            title: tempBook.title,
            quantity: 3,
            allowPreorder: false,
          },
        ],
      }),
    );

    const afterReserve = await prisma.stockItem.findUniqueOrThrow({
      where: { id: stockItem.id },
    });
    assert.equal(afterReserve.quantity, 5);
    assert.equal(afterReserve.reserved, 3);

    // Tentativa concorrente de reservar 4 unidades quando só restam 2 livres -> DEVE FALHAR!
    await assert.rejects(() =>
      prisma.$transaction((tx) =>
        reserveOrderStockInTx(tx, {
          orderId: order2.id,
          orderNumber: order2.orderNumber!,
          countryCode: "MZ",
          items: [
            {
              bookId: tempBook.id,
              title: tempBook.title,
              quantity: 4,
              allowPreorder: false,
            },
          ],
        }),
      ),
    );

    // Confirmação de pagamento de order1 -> deduz stock físico (5 -> 2) e liberta reserved (3 -> 0)
    await prisma.$transaction((tx) =>
      commitOrderStockOnPaymentInTx(tx, order1.id, adminUser.email),
    );
    const afterCommit = await prisma.stockItem.findUniqueOrThrow({
      where: { id: stockItem.id },
    });
    assert.equal(afterCommit.quantity, 2);
    assert.equal(afterCommit.reserved, 0);

    // Reembolso -> repõe stock físico (2 -> 5) e cria movimento ORDER_REFUND
    await prisma.$transaction((tx) =>
      releaseOrRefundOrderStockInTx(tx, order1.id, "REFUND", adminUser.email),
    );
    const afterRefund = await prisma.stockItem.findUniqueOrThrow({
      where: { id: stockItem.id },
    });
    assert.equal(afterRefund.quantity, 5);

    // Testa também expiração automática de reservas vencidas em order2
    await prisma.$transaction((tx) =>
      reserveOrderStockInTx(tx, {
        orderId: order2.id,
        orderNumber: order2.orderNumber!,
        countryCode: "MZ",
        items: [
          {
            bookId: tempBook.id,
            title: tempBook.title,
            quantity: 2,
            allowPreorder: false,
          },
        ],
      }),
    );
    await prisma.stockReservation.updateMany({
      where: { orderId: order2.id },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    const released = await releaseExpiredReservations();
    assert.ok(released >= 1);

    const afterExpiry = await prisma.stockItem.findUniqueOrThrow({
      where: { id: stockItem.id },
    });
    assert.equal(afterExpiry.reserved, 0);

    // Limpeza dos dados de teste
    await prisma.order.deleteMany({ where: { id: { in: [order1.id, order2.id] } } });
    await prisma.book.delete({ where: { id: tempBook.id } });
  });

  it("5. Pagamentos honestos por país e validação criptográfica HMAC de webhooks", () => {
    const methodsAO = getAvailablePaymentMethodsForMarket({
      market: "AO",
      currency: "KZ",
      clientType: "LIVRARIA",
    });
    assert.ok(methodsAO.some((m) => m.provider === "bank_transfer"));
    // Sem STRIPE_SECRET_KEY configurado, nunca deve fingir pagamento automático por cartão!
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      assert.equal(
        methodsAO.some((m) => m.provider === "stripe"),
        false,
      );
    }

    const secret = "segredo-webhook-teste-hmac-256";
    const rawPayload = JSON.stringify({
      eventId: "evt_001",
      orderId: "ord_123",
      status: "PAID",
    });
    const validSig = crypto
      .createHmac("sha256", secret)
      .update(rawPayload)
      .digest("hex");

    assert.equal(
      verifyPaymentWebhookSignature(rawPayload, validSig, secret),
      true,
    );
    assert.equal(
      verifyPaymentWebhookSignature(
        rawPayload,
        "assinatura-invalida-adulterada",
        secret,
      ),
      false,
    );
  });

  it("6. Validação de email e registo honesto quando fornecedor SMTP/Resend não está configurado", async () => {
    assert.equal(isValidEmailAddress("invalido@@sem-dominio"), false);
    assert.equal(isValidEmailAddress("cliente@escola.co.mz"), true);

    const invalidAttempt = await sendTransactionalEmail({
      template: "REGISTRATION_WELCOME",
      to: "email-invalido",
      data: { name: "Teste" },
    });
    assert.equal(invalidAttempt.sent, false);
    assert.equal(invalidAttempt.status, "INVALID_EMAIL");

    if (!process.env.SMTP_HOST?.trim() && !process.env.RESEND_API_KEY?.trim()) {
      const honestUnconfigured = await sendTransactionalEmail({
        template: "QUOTE_REQUEST",
        to: "compras@livraria-teste.co.mz",
        data: {
          quoteNumber: "COT-TEST-001",
          contactName: "Direção",
          marketName: "Moçambique",
        },
      });
      assert.equal(honestUnconfigured.sent, false);
      assert.equal(honestUnconfigured.status, "UNCONFIGURED");
    }
  });

  it("7. Geração de Catálogo PDF Profissional com capas reais, ISBN e preços oficiais", async () => {
    const books = await getAllCatalogBooks();
    const pdfBuffer = generateCatalogPdfBuffer({
      books: books.slice(0, 10),
      market: "MZ",
      currency: "MT",
      categoryFilter: "Escolar",
      generatedBy: "Suite Automatizada Pro Capital",
    });

    assert.ok(Buffer.isBuffer(pdfBuffer));
    assert.ok(pdfBuffer.byteLength > 5_000, "PDF deve conter páginas e capas reais");
    assert.equal(pdfBuffer.subarray(0, 4).toString("ascii"), "%PDF");
  });

  it("8. Geração de Fatura Proforma / Documento Comercial PDF real a partir do snapshot da encomenda", async () => {
    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { email: "admin@procapitalmz.com" },
    });
    const sampleBook = await prisma.book.findFirstOrThrow();

    const tempOrder = await prisma.order.create({
      data: {
        orderNumber: `PC-DOC-${Date.now()}`,
        status: "AWAITING_PAYMENT",
        paymentStatus: "PENDING_TRANSFER",
        countryCode: "AO",
        currency: "KZ",
        buyerName: "Direção Financeira Teste",
        buyerEmail: "financeiro@escola-luanda.ao",
        buyerTaxId: "5417000123",
        companyName: "Colégio Internacional de Luanda",
        clientType: "ESCOLA",
        shippingAddress: "Talatona, Via S8",
        shippingCity: "Luanda",
        subtotalAmount: 65000,
        discountAmount: 6500,
        shippingAmount: 2500,
        totalAmount: 61000,
        userId: adminUser.id,
        items: {
          create: [
            {
              bookId: sampleBook.id,
              quantity: 10,
              unitPrice: 6500,
              titleSnapshot: sampleBook.title,
              isbnSnapshot: sampleBook.isbn,
              publisherSnapshot: sampleBook.editora,
              currencySnapshot: "KZ",
              discountPercent: 10,
            },
          ],
        },
      },
    });

    try {
      const pdfDoc = await generateOrderCommercialPdf(tempOrder.id);
      assert.ok(pdfDoc, "Deve gerar documento comercial válido");
      assert.equal(pdfDoc.buffer.subarray(0, 4).toString("ascii"), "%PDF");
      assert.ok(pdfDoc.buffer.byteLength > 3_000);
      assert.match(pdfDoc.filename, /^procapital-documento-pc-doc-/);
    } finally {
      await prisma.order.delete({ where: { id: tempOrder.id } });
    }
  });
});
