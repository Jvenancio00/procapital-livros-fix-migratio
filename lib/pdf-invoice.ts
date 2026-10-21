import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import {
  CLIENT_TYPE_LABELS,
  MARKETS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/markets";

export interface GeneratedDocumentResult {
  buffer: Buffer;
  filename: string;
  orderNumber: string;
}

export async function generateOrderCommercialPdf(
  orderId: string,
): Promise<GeneratedDocumentResult | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { book: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 3 },
      user: true,
    },
  });

  if (!order) return null;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const orderCode = order.orderNumber ?? `PC-${order.id.slice(-8).toUpperCase()}`;
  const isPaid = ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(
    order.status,
  );
  const docTitle = isPaid
    ? "NOTA DE ENCOMENDA CONFIRMADA / RECIBO COMERCIAL"
    : "FATURA PROFORMA / NOTA DE ENCOMENDA COMERCIAL";

  // Cabeçalho institucional azul-marinho (#0F172A) com filete dourado (#F59E0B)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, "F");
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 42, pageWidth, 1.8, "F");

  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath).toString("base64");
      doc.addImage(
        `data:image/png;base64,${logoBase64}`,
        "PNG",
        margin,
        9,
        14,
        14,
      );
    }
  } catch {
    // Segue com cabeçalho tipográfico caso o logótipo não esteja disponível
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PRO CAPITAL — DISTRIBUIDORA DE LIVROS", margin + 18, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    "Distribuição Editorial & Escolar · Angola · Moçambique · Portugal · Brasil",
    margin + 18,
    21,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(245, 158, 11);
  doc.text(docTitle, margin, 34);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(orderCode, pageWidth - margin, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    `Emitido em: ${new Date().toLocaleDateString("pt-PT")}`,
    pageWidth - margin,
    22,
    { align: "right" },
  );
  doc.text(
    `Data da encomenda: ${new Date(order.createdAt).toLocaleDateString("pt-PT")}`,
    pageWidth - margin,
    27.5,
    { align: "right" },
  );

  let y = 52;

  // Bloco de dados fiscais do cliente e estado
  doc.setFillColor(250, 248, 245);
  doc.roundedRect(margin, y, contentWidth, 34, 2.5, 2.5, "F");

  const marketName = MARKETS[order.countryCode]?.name ?? order.countryCode;
  const buyerName = order.buyerName || order.user.name || "Cliente Pro Capital";
  const buyerEmail = order.buyerEmail || order.user.email;
  const company = order.companyName || "—";
  const taxId = order.buyerTaxId || "Não indicado";

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DADOS DO COMPRADOR / ENTIDADE", margin + 4, y + 6.5);
  doc.text("CONDIÇÕES & ESTADO", margin + contentWidth * 0.56, y + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Nome / Contacto: ${buyerName}`, margin + 4, y + 12.5);
  doc.text(`Entidade / Empresa: ${company}`, margin + 4, y + 17.5);
  doc.text(`NIF / NUIT / CNPJ: ${taxId}`, margin + 4, y + 22.5);
  doc.text(`Email: ${buyerEmail}`, margin + 4, y + 27.5);
  if (order.shippingAddress) {
    doc.text(
      `Entrega: ${order.shippingAddress}${order.shippingCity ? `, ${order.shippingCity}` : ""}`.slice(
        0,
        58,
      ),
      margin + 4,
      y + 32,
    );
  }

  doc.text(
    `Perfil: ${CLIENT_TYPE_LABELS[order.clientType] ?? order.clientType}`,
    margin + contentWidth * 0.56,
    y + 12.5,
  );
  doc.text(
    `Mercado / Moeda: ${marketName} (${order.currency})`,
    margin + contentWidth * 0.56,
    y + 17.5,
  );
  doc.text(
    `Estado Encomenda: ${ORDER_STATUS_LABELS[order.status] ?? order.status}`,
    margin + contentWidth * 0.56,
    y + 22.5,
  );
  doc.text(
    `Estado Pagamento: ${PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}`,
    margin + contentWidth * 0.56,
    y + 27.5,
  );

  y += 42;

  // Cabeçalho da tabela de itens
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ISBN", margin + 3, y + 5.3);
  doc.text("TÍTULO / OBRA", margin + 33, y + 5.3);
  doc.text("QTD", margin + 122, y + 5.3, { align: "right" });
  doc.text("PREÇO UNIT.", margin + 149, y + 5.3, { align: "right" });
  doc.text("SUBTOTAL", margin + contentWidth - 3, y + 5.3, { align: "right" });

  y += 8;
  doc.setFont("helvetica", "normal");

  for (let idx = 0; idx < order.items.length; idx++) {
    const item = order.items[idx];
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 8, "F");
    }

    const isbn = item.isbnSnapshot || item.book.isbn || "—";
    const title = (item.titleSnapshot || item.book.title).slice(0, 48);
    const unit = Number(item.unitPrice);
    const lineTotal = unit * item.quantity;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.text(isbn.slice(0, 17), margin + 3, y + 5.2);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 33, y + 5.2);
    doc.text(String(item.quantity), margin + 122, y + 5.2, { align: "right" });
    doc.text(formatMoney(unit, order.currency), margin + 149, y + 5.2, {
      align: "right",
    });
    doc.setFont("helvetica", "bold");
    doc.text(
      formatMoney(lineTotal, order.currency),
      margin + contentWidth - 3,
      y + 5.2,
      { align: "right" },
    );
    doc.setFont("helvetica", "normal");
    y += 8;
  }

  y += 6;

  // Resumo financeiro
  const boxX = margin + contentWidth - 78;
  doc.setDrawColor(226, 232, 240);
  doc.line(boxX, y, margin + contentWidth, y);
  y += 5.5;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", boxX, y);
  doc.text(
    formatMoney(Number(order.subtotalAmount), order.currency),
    margin + contentWidth - 2,
    y,
    { align: "right" },
  );
  y += 5;

  if (Number(order.discountAmount) > 0) {
    doc.text("Desconto comercial:", boxX, y);
    doc.text(
      `- ${formatMoney(Number(order.discountAmount), order.currency)}`,
      margin + contentWidth - 2,
      y,
      { align: "right" },
    );
    y += 5;
  }

  doc.text("Expedição / Portes:", boxX, y);
  doc.text(
    Number(order.shippingAmount) === 0
      ? "Grátis / Balcão"
      : formatMoney(Number(order.shippingAmount), order.currency),
    margin + contentWidth - 2,
    y,
    { align: "right" },
  );
  y += 6.5;

  doc.setFillColor(153, 27, 27);
  doc.roundedRect(boxX - 2, y - 4.2, 80, 9, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("TOTAL A LIQUIDAR:", boxX + 2, y + 1.5);
  doc.text(
    formatMoney(Number(order.totalAmount), order.currency),
    margin + contentWidth - 4,
    y + 1.5,
    { align: "right" },
  );

  y += 14;

  // Instruções bancárias oficiais do mercado (MarketConfig na BD ou predefinição do mercado)
  const countryCfg = await prisma.marketConfig.findUnique({
    where: { code: order.countryCode },
    select: { bankAccountDetails: true },
  });
  const bankDetailsText =
    countryCfg?.bankAccountDetails ||
    MARKETS[order.countryCode]?.defaultBankDetails ||
    "Solicite os dados de IBAN/NIB atualizados à equipa financeira Pro Capital.";

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);

  if (isPaid) {
    doc.text("CONFIRMAÇÃO DE LIQUIDAÇÃO COMERCIAL", margin + 4, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Pagamento validado para a encomenda ${orderCode}. Documento emitido pela plataforma Pro Capital.`,
      margin + 4,
      y + 13.5,
    );
  } else {
    doc.text(
      `INSTRUÇÕES PARA LIQUIDAÇÃO BANCÁRIA (${marketName})`,
      margin + 4,
      y + 6.5,
    );
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const wrapped = doc.splitTextToSize(
      `${bankDetailsText} | Indicar referência: ${orderCode}`,
      contentWidth - 8,
    );
    doc.text(wrapped.slice(0, 3), margin + 4, y + 12);
  }

  // Rodapé institucional
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Pro Capital — Distribuidora de Livros · Documento comercial gerado automaticamente a partir do registo oficial da encomenda.",
    pageWidth / 2,
    288,
    { align: "center" },
  );

  const arrayBuffer = doc.output("arraybuffer");
  return {
    buffer: Buffer.from(arrayBuffer),
    filename: `procapital-documento-${orderCode.toLowerCase()}.pdf`,
    orderNumber: orderCode,
  };
}
