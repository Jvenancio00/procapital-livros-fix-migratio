import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";
import {
  analyzeImportSpreadsheet,
  commitImportSpreadsheet,
} from "@/lib/excel-import";

export async function GET(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(request.url);

  // Exporta modelo oficial .xlsx para facilitar preenchimento pelas equipas
  if (searchParams.get("template") === "1") {
    const sampleRows = [
      {
        ISBN: "9789722126342",
        Título: "Terra Sonâmbula",
        Autor: "Mia Couto",
        Editora: "Editorial Caminho",
        Categoria: "Ficção",
        País: "Moçambique",
        Moeda: "MT",
        Armazém: "MZ-MPM-01",
        Quantidade: 60,
        Preço: 950,
        Nível: "ENSINO_SECUNDARIO",
        Classe: "",
        Disciplina: "Literatura Lusófona",
        Ano_Letivo: 2026,
      },
      {
        ISBN: "9789720001016",
        Título: "Física Experimental — 9ª Classe",
        Autor: "Equipa Pedagógica Plural",
        Editora: "Plural Editores",
        Categoria: "Escolar",
        País: "Angola",
        Moeda: "KZ",
        Armazém: "AO-LAD-01",
        Quantidade: 120,
        Preço: 6800,
        Nível: "ENSINO_SECUNDARIO",
        Classe: "9ª Classe",
        Disciplina: "Física",
        Ano_Letivo: 2026,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo_Importacao");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="modelo-importacao-procapital.xlsx"',
      },
    });
  }

  // Exporta relatório detalhado de uma importação anterior em .xlsx
  const exportBatchId = searchParams.get("exportBatchId");
  if (exportBatchId) {
    const batch = await prisma.importBatch.findUnique({
      where: { id: exportBatchId },
    });
    if (!batch) {
      return NextResponse.json({ error: "Importação não encontrada." }, { status: 404 });
    }
    const reportRows = Array.isArray(batch.reportJson)
      ? (batch.reportJson as Record<string, unknown>[])
      : [];
    const ws = XLSX.utils.json_to_sheet(reportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio_Importacao");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="relatorio-importacao-${batch.id.slice(-6)}.xlsx"`,
      },
    });
  }

  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ batches });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(
      { error: "Envie o ficheiro em formato multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum ficheiro selecionado." }, { status: 400 });
  }

  const filename = file.name || "importacao.xlsx";
  const lower = filename.toLowerCase();
  if (!lower.endsWith(".xlsx") && !lower.endsWith(".csv") && !lower.endsWith(".xls")) {
    return NextResponse.json(
      { error: "Formato inválido. Carregue apenas ficheiros .xlsx ou .csv." },
      { status: 400 }
    );
  }

  const step = String(formData.get("step") ?? "preview");
  const actions = {
    updateStock: formData.get("updateStock") === "true",
    updatePrices: formData.get("updatePrices") === "true",
    importNewBooks: formData.get("importNewBooks") === "true",
  };

  if (!actions.updateStock && !actions.updatePrices && !actions.importNewBooks) {
    return NextResponse.json(
      {
        error:
          "Selecione pelo menos uma operação: Atualizar stock, Atualizar preços ou Importar novos livros.",
      },
      { status: 400 }
    );
  }

  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  if (step === "preview") {
    const preview = await analyzeImportSpreadsheet(buffer, filename, actions);
    return NextResponse.json({ step: "preview", preview });
  }

  if (step === "commit") {
    const result = await commitImportSpreadsheet({
      buffer,
      filename,
      actions,
      actorId: guard.actor.id,
      actorEmail: guard.actor.email,
    });

    await recordAuditLog({
      action: "STOCK_IMPORT_COMMITTED",
      entityType: "ImportBatch",
      entityId: result.batchId,
      actorId: guard.actor.id,
      actorEmail: guard.actor.email,
      details: {
        filename,
        actions,
        createdBooks: result.createdBooks,
        updatedStock: result.updatedStock,
        updatedPrices: result.updatedPrices,
        errorRows: result.errorRows,
      },
    });

    return NextResponse.json({ step: "commit", result });
  }

  return NextResponse.json({ error: "Passo de importação desconhecido." }, { status: 400 });
}
