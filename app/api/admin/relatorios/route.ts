import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const check = await requireAdminApi();
  if (check.error) return check.error;

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") ?? "stock";
  const formato = searchParams.get("formato") === "csv" ? "csv" : "xlsx";

  let sheetName = "Relatorio";
  let rows: Array<Record<string, unknown>> = [];

  if (tipo === "vendas") {
    sheetName = "Encomendas_Vendas";
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, user: true },
    });
    rows = orders.map((o) => ({
      Numero: o.orderNumber ?? o.id,
      Data: o.createdAt.toISOString(),
      Cliente: o.buyerName || o.user.name || "",
      Email: o.buyerEmail || o.user.email,
      Empresa: o.companyName ?? "",
      NIF_NUIT: o.buyerTaxId ?? "",
      Perfil: o.clientType,
      Pais: o.countryCode,
      Moeda: o.currency,
      Itens: o.items.reduce((acc, i) => acc + i.quantity, 0),
      Subtotal: Number(o.subtotalAmount),
      Desconto: Number(o.discountAmount),
      Portes: Number(o.shippingAmount),
      Total: Number(o.totalAmount),
      EstadoEncomenda: o.status,
      EstadoPagamento: o.paymentStatus,
      FaturaSolicitada: o.invoiceRequested ? "Sim" : "Não",
    }));
  } else if (tipo === "cotacoes") {
    sheetName = "Cotacoes_B2B";
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    rows = quotes.map((q) => ({
      NumeroCotacao: q.quoteNumber,
      Data: q.createdAt.toISOString(),
      Contacto: q.contactName,
      Email: q.email,
      Telefone: q.phone ?? "",
      Instituicao: q.organizationName ?? "",
      NIF_NUIT: q.taxId ?? "",
      Perfil: q.clientType,
      Pais: q.countryCode,
      Moeda: q.currency,
      AnoLetivo: q.academicYear ?? "",
      TotalUnidades: q.items.reduce((acc, i) => acc + i.quantity, 0),
      ValorEstimado: q.estimatedTotal ? Number(q.estimatedTotal) : "",
      ValorProposto: q.quotedTotal ? Number(q.quotedTotal) : "",
      Estado: q.status,
    }));
  } else {
    sheetName = "Stock_Armazens";
    const stockItems = await prisma.stockItem.findMany({
      include: { book: true, warehouse: true },
      orderBy: [{ warehouse: { countryCode: "asc" } }, { quantity: "asc" }],
    });
    rows = stockItems.map((s) => {
      const available = Math.max(0, s.quantity - s.reserved);
      return {
        Pais: s.warehouse.countryCode,
        ArmazemCodigo: s.warehouse.code,
        ArmazemNome: s.warehouse.name,
        ISBN: s.book.isbn ?? "",
        Titulo: s.book.title,
        Autor: s.book.author,
        Editora: s.book.editora ?? "",
        StockFisico: s.quantity,
        Reservado: s.reserved,
        Disponivel: available,
        LimiaresAlerta: s.lowStockThreshold,
        AlertaStockBaixo: available <= s.lowStockThreshold ? "SIM" : "NAO",
      };
    });
  }

  const safeRows =
    rows.length > 0 ? rows : [{ Info: "Sem registos disponíveis para este filtro" }];

  if (formato === "csv") {
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(safeRows));
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="procapital-relatorio-${tipo}.csv"`,
      },
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(safeRows), sheetName);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="procapital-relatorio-${tipo}.xlsx"`,
    },
  });
}
