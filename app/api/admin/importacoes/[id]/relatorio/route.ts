import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdminApi();
  if (check.error) return check.error;

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("formato") === "csv" ? "csv" : "xlsx";

  const batch = await prisma.importBatch.findUnique({
    where: { id },
    include: {
      movements: {
        include: {
          stockItem: {
            include: { book: true, warehouse: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!batch) {
    return NextResponse.json(
      { error: "Lote de importação não encontrado." },
      { status: 404 },
    );
  }

  const reportPayload = (batch.reportJson ?? {}) as {
    rows?: Array<Record<string, unknown>>;
    errors?: Array<Record<string, unknown>>;
  };

  const detailRows =
    Array.isArray(reportPayload.rows) && reportPayload.rows.length > 0
      ? reportPayload.rows
      : batch.movements.map((mv) => ({
          data: mv.createdAt.toISOString(),
          isbn: mv.stockItem.book.isbn ?? "",
          titulo: mv.stockItem.book.title,
          armazem: mv.stockItem.warehouse.code,
          pais: mv.stockItem.warehouse.countryCode,
          stock_anterior: mv.previousQty,
          variacao: mv.delta,
          stock_novo: mv.newQty,
          motivo: mv.reason ?? "Importação Excel/CSV",
        }));

  const summarySheet = [
    {
      LoteID: batch.id,
      Ficheiro: batch.filename,
      Estado: batch.status,
      Data: batch.createdAt.toISOString(),
      Operador: batch.actorEmail ?? "",
      TotalLinhas: batch.totalRows,
      LinhasValidas: batch.validRows,
      NovosLivros: batch.createdBooks,
      StocksAtualizados: batch.updatedStock,
      PrecosAtualizados: batch.updatedPrices,
      Ignoradas: batch.skippedRows,
      ComErro: batch.errorRows,
    },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(summarySheet),
    "Resumo",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      detailRows.length > 0 ? detailRows : [{ info: "Sem movimentos detalhados" }],
    ),
    "Linhas_Movimentos",
  );

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(
      XLSX.utils.json_to_sheet(
        detailRows.length > 0 ? detailRows : summarySheet,
      ),
    );
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio-importacao-${batch.id.slice(-8)}.csv"`,
      },
    });
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-importacao-${batch.id.slice(-8)}.xlsx"`,
    },
  });
}
