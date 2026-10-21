import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";
import type { Book } from "@/data/books";
import { formatMoney } from "@/lib/currency";
import type { Currency, MarketCode } from "@/lib/enums";
import { EDUCATION_LEVEL_LABELS, MARKETS } from "@/lib/markets";
import { getBookAvailableStock, getBookPriceForMarket } from "@/lib/catalog";

export interface CatalogPdfOptions {
  books: Book[];
  market: MarketCode | "ALL";
  currency: Currency;
  publisherFilter?: string;
  categoryFilter?: string;
  educationLevelFilter?: string;
  availabilityFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  includeFullStockNumbers?: boolean; // reservado a administradores
  generatedBy?: string;
}

function loadCoverBase64(coverUrl?: string): string | null {
  if (!coverUrl || !coverUrl.startsWith("/")) return null;
  try {
    const absPath = path.join(process.cwd(), "public", coverUrl.replace(/^\//, ""));
    if (!fs.existsSync(absPath)) return null;
    const ext = path.extname(absPath).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") return null;
    const buf = fs.readFileSync(absPath);
    const mime = ext === ".png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export function generateCatalogPdfBuffer(options: CatalogPdfOptions): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const emissionDate = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const marketLabel =
    options.market === "ALL"
      ? `Multimercado CPLP (${options.currency})`
      : `${MARKETS[options.market].name} (${MARKETS[options.market].isoCurrency} / ${options.currency})`;

  const drawPageHeader = (pageNumber: number) => {
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, pageWidth, 24, "F");
    doc.setFillColor(245, 158, 11); // #F59E0B accent rule
    doc.rect(0, 24, pageWidth, 1.2, "F");

    doc.setTextColor(245, 158, 11);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PRO CAPITAL · DISTRIBUIDORA EDITORIAL", margin, 9.5);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(
      options.publisherFilter && options.publisherFilter !== "Todas"
        ? `Catálogo Comercial — ${options.publisherFilter}`
        : "Catálogo Editorial & Escolar",
      margin,
      17.5
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Mercado: ${marketLabel}`, pageWidth - margin, 10, { align: "right" });
    doc.text(`Emissão: ${emissionDate} · Pág. ${pageNumber}`, pageWidth - margin, 17, {
      align: "right",
    });
  };

  const drawPageFooter = () => {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Pro Capital, Lda · NUIT 401430857 · Rua Almeida Garrett, n.º 366, Maputo · comercial@procapitalmz.com",
      margin,
      pageHeight - 7.5
    );
    doc.setTextColor(153, 27, 27);
    doc.setFont("helvetica", "bold");
    doc.text(`${options.books.length} título(s)`, pageWidth - margin, pageHeight - 7.5, {
      align: "right",
    });
  };

  let pageNumber = 1;
  drawPageHeader(pageNumber);

  // Bloco de resumo comercial na primeira página
  let y = 31;
  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(231, 226, 216);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

  const activeFilters = [
    `Mercado: ${marketLabel}`,
    options.categoryFilter && options.categoryFilter !== "Todos"
      ? `Categoria: ${options.categoryFilter}`
      : " Todas as categorias",
    options.educationLevelFilter && options.educationLevelFilter !== "ALL"
      ? `Nível: ${EDUCATION_LEVEL_LABELS[options.educationLevelFilter] ?? options.educationLevelFilter}`
      : null,
    options.publisherFilter && options.publisherFilter !== "Todas"
      ? `Editora: ${options.publisherFilter}`
      : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("Condições e Âmbito do Catálogo Comercial", margin + 4, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(activeFilters.slice(0, 118), margin + 4, y + 13);

  y += 24;

  const colGap = 6;
  const cardWidth = (contentWidth - colGap) / 2;
  const cardHeight = 42;

  options.books.forEach((book, idx) => {
    const col = idx % 2;
    if (col === 0 && idx > 0) {
      y += cardHeight + 5;
    }

    if (y + cardHeight > pageHeight - 18) {
      drawPageFooter();
      doc.addPage();
      pageNumber += 1;
      drawPageHeader(pageNumber);
      y = 31;
    }

    const x = margin + col * (cardWidth + colGap);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");

    // Capa real ou bloco tipográfico editorial
    const coverX = x + 3;
    const coverY = y + 3;
    const coverW = 25;
    const coverH = 36;
    const coverDataUri = loadCoverBase64(book.coverUrl);

    if (coverDataUri) {
      try {
        const format = coverDataUri.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(coverDataUri, format, coverX, coverY, coverW, coverH);
      } catch {
        doc.setFillColor(15, 23, 42);
        doc.rect(coverX, coverY, coverW, coverH, "F");
      }
    } else {
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(coverX, coverY, coverW, coverH, 1.2, 1.2, "F");
      doc.setTextColor(245, 158, 11);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      const shortEd = doc.splitTextToSize(book.editora.toUpperCase(), coverW - 4);
      doc.text(shortEd.slice(0, 2), coverX + coverW / 2, coverY + 17, { align: "center" });
    }

    // Metadados do livro à direita da capa
    const textX = coverX + coverW + 3.5;
    const textMaxW = cardWidth - coverW - 10;

    // Categoria / classe
    const badge = [book.category, book.schoolGrade].filter(Boolean).join(" · ").toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(153, 27, 27); // #991B1B
    doc.text(badge.slice(0, 38), textX, y + 6.5);

    // Título (até 2 linhas)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(book.title, textMaxW).slice(0, 2);
    doc.text(titleLines, textX, y + 11.5);

    const afterTitleY = y + 11.5 + titleLines.length * 3.8;

    // Autor e Editora
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(71, 85, 105);
    const authorLine = doc.splitTextToSize(book.author, textMaxW)[0] ?? "";
    doc.text(authorLine, textX, afterTitleY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(`Editora: ${book.editora}`.slice(0, 42), textX, afterTitleY + 4);

    // ISBN
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      book.isbn ? `ISBN: ${book.isbn}` : "ISBN: Edição editorial oficial",
      textX,
      afterTitleY + 8
    );

    // Rodapé do cartão: Disponibilidade + Preço comercial local
    const stock = getBookAvailableStock(book, options.market);
    const availText = options.includeFullStockNumbers
      ? stock > 0
        ? `Stock: ${stock} un.`
        : "Sob cotação"
      : stock > 0
      ? "Disponível"
      : "Sob consulta";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(stock > 0 ? 21 : 180, stock > 0 ? 128 : 83, stock > 0 ? 61 : 9);
    doc.text(availText, textX, y + cardHeight - 3.8);

    const priceVal = getBookPriceForMarket(book, options.currency);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.2);
    doc.setTextColor(153, 27, 27);
    doc.text(
      book.free
        ? "Gratuito"
        : priceVal > 0
        ? formatMoney(priceVal, options.currency)
        : "Sob consulta",
      x + cardWidth - 3.5,
      y + cardHeight - 3.6,
      { align: "right" }
    );
  });

  drawPageFooter();
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
