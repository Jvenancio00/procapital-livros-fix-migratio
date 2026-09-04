import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, TextRun } from "docx";
import * as XLSX from "xlsx";
import type { Book } from "@/data/books";
import type { ClientSession } from "@/hooks/useClientAuth";

export interface OrderItem extends Book {
  quantity: number;
}

export function exportOrderPDF(
  items: OrderItem[],
  session: ClientSession,
  totalPrice: number
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("NOTA DE ENCOMENDA", margin, yPosition);
  yPosition += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString("pt-PT")}`, margin, yPosition);
  yPosition += 6;

  // Company info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Pro Capital", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Distribuidora de Livros", margin, yPosition);
  yPosition += 5;
  doc.text("Rua Gil Vicente, nº 79, R/C, Bairro Coop", margin, yPosition);
  yPosition += 5;
  doc.text("Maputo, Moçambique", margin, yPosition);
  yPosition += 5;
  doc.text("NUIT: 401430857", margin, yPosition);
  yPosition += 10;

  // Client info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Cliente", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(session.company, margin, yPosition);
  yPosition += 5;
  doc.text(`Email: ${session.email}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Tipo: ${session.type.charAt(0).toUpperCase() + session.type.slice(1)}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Desconto: ${session.discount}%`, margin, yPosition);
  yPosition += 10;

  // Items table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  const columns = [
    { label: "Produto", x: margin, width: contentWidth * 0.5, align: "left" as const },
    { label: "Preço Unit.", x: margin + contentWidth * 0.5, width: contentWidth * 0.15, align: "right" as const },
    { label: "Qtd", x: margin + contentWidth * 0.65, width: contentWidth * 0.15, align: "center" as const },
    { label: "Subtotal", x: margin + contentWidth * 0.8, width: contentWidth * 0.2, align: "right" as const },
  ];

  const rowHeight = 7;
  const pageBottomLimit = pageHeight - margin;

  const drawCell = (text: string, col: (typeof columns)[number]) => {
    const cellX =
      col.align === "right"
        ? col.x + col.width
        : col.align === "center"
        ? col.x + col.width / 2
        : col.x;
    doc.text(text, cellX, yPosition, { align: col.align });
  };

  // Cabeçalho da tabela
  doc.setFillColor(230, 230, 230);
  doc.rect(margin, yPosition - 5, contentWidth, rowHeight, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  columns.forEach((col) => drawCell(col.label, col));
  yPosition += rowHeight;

  // Linhas da tabela
  doc.setFont("helvetica", "normal");
  items.forEach((item) => {
    if (yPosition > pageBottomLimit) {
      doc.addPage();
      yPosition = margin;
    }

    const discountedPrice = item.price * (1 - session.discount / 100);
    const row = [
      item.title.substring(0, 35),
      `${discountedPrice.toFixed(2)} MT`,
      item.quantity.toString(),
      `${(discountedPrice * item.quantity).toFixed(2)} MT`,
    ];
    row.forEach((text, i) => drawCell(text, columns[i]));
    yPosition += rowHeight;
  });

  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, margin + contentWidth, yPosition);
  yPosition += 12;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Total: ${totalPrice.toFixed(2)} MT`, pageWidth - margin - 60, yPosition);

  doc.save(`encomenda_${session.company.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}

export async function exportOrderWord(
  items: OrderItem[],
  session: ClientSession,
  totalPrice: number
) {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Produto", bold: true })] })],
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Preço Unit.", bold: true })] })],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Qtd", bold: true })] })],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Subtotal", bold: true })] })],
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  items.forEach((item) => {
    const discountedPrice = item.price * (1 - session.discount / 100);
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph(item.title)],
          }),
          new TableCell({
            children: [new Paragraph(`${discountedPrice.toFixed(2)} MT`)],
          }),
          new TableCell({
            children: [new Paragraph(item.quantity.toString())],
          }),
          new TableCell({
            children: [new Paragraph(`${(discountedPrice * item.quantity).toFixed(2)} MT`)],
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "NOTA DE ENCOMENDA", bold: true, size: 28 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Data: ${new Date().toLocaleDateString("pt-PT")}`, size: 20 })],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [new TextRun({ text: "Pro Capital - Distribuidora de Livros", bold: true, size: 24 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "Rua Gil Vicente, nº 79, R/C, Bairro Coop, Maputo", size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "NUIT: 401430857", size: 20 })],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [new TextRun({ text: "Cliente", bold: true, size: 24 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: session.company, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Email: ${session.email}`, size: 20 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Tipo: ${session.type.charAt(0).toUpperCase() + session.type.slice(1)}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Desconto Aplicado: ${session.discount}%`, bold: true, size: 20 }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [new TextRun({ text: "Artigos Encomendados", bold: true, size: 24 })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
          }),

          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: `Total: ${totalPrice.toFixed(2)} MT`, bold: true, size: 24 })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `encomenda_${session.company.replace(/\s+/g, "_")}_${Date.now()}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportOrderExcel(
  items: OrderItem[],
  session: ClientSession,
  totalPrice: number
) {
  const worksheetData: (string | number)[][] = [
    ["NOTA DE ENCOMENDA"],
    [`Data: ${new Date().toLocaleDateString("pt-PT")}`],
    [],
    ["PRO CAPITAL - DISTRIBUIDORA DE LIVROS"],
    ["Rua Gil Vicente, nº 79, R/C, Bairro Coop, Maputo"],
    ["NUIT: 401430857"],
    [],
    ["CLIENTE"],
    [session.company],
    [`Email: ${session.email}`],
    [`Tipo: ${session.type.charAt(0).toUpperCase() + session.type.slice(1)}`],
    [`Desconto: ${session.discount}%`],
    [],
    ["Produto", "Preço Unit.", "Qtd", "Subtotal"],
  ];

  items.forEach((item) => {
    const discountedPrice = item.price * (1 - session.discount / 100);
    worksheetData.push([
      item.title,
      discountedPrice,
      item.quantity,
      discountedPrice * item.quantity,
    ]);
  });

  worksheetData.push([]);
  worksheetData.push(["TOTAL", "", "", totalPrice]);

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Encomenda");

  XLSX.writeFile(
    workbook,
    `encomenda_${session.company.replace(/\s+/g, "_")}_${Date.now()}.xlsx`
  );
}
