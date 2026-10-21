import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET() {
  const check = await requireAdminApi();
  if (check.error) return check.error;

  const sampleRows = [
    {
      isbn: "9789720019257",
      titulo: "Matemática — 8.ª Classe (Manual do Aluno)",
      autor: "Equipa Pedagógica Plural",
      editora: "Plural Editores",
      categoria: "Escolar",
      nivel_ensino: "SECUNDARIO",
      classe: "8ª Classe",
      disciplina: "Matemática",
      ano_letivo: 2026,
      pais: "MZ",
      armazem: "WH-MZ-MPM",
      stock: 120,
      preco: 890,
      moeda: "MT",
    },
    {
      isbn: "9789897224119",
      titulo: "Língua Portuguesa — 6.ª Classe",
      autor: "Equipa Editorial Angola",
      editora: "Texto Editores",
      categoria: "Escolar",
      nivel_ensino: "PRIMARIO",
      classe: "6ª Classe",
      disciplina: "Português",
      ano_letivo: 2026,
      pais: "AO",
      armazem: "WH-AO-LAD",
      stock: 200,
      preco: 6500,
      moeda: "KZ",
    },
  ];

  const guideRows = [
    {
      Campo: "isbn",
      Obrigatorio: "Recomendado (chave prioritária)",
      ValoresAceites: "ISBN-10 ou ISBN-13 válido (com ou sem hífens)",
    },
    {
      Campo: "titulo",
      Obrigatorio: "Obrigatório para novos livros",
      ValoresAceites: "Título completo da obra",
    },
    {
      Campo: "pais / moeda",
      Obrigatorio: "Opcional (padrão MZ / MT)",
      ValoresAceites: "AO (KZ), MZ (MT), PT (EUR), BR (BRL)",
    },
    {
      Campo: "nivel_ensino",
      Obrigatorio: "Opcional (livros escolares)",
      ValoresAceites: "PRIMARIO, SECUNDARIO, TECNICO, SUPERIOR",
    },
    {
      Campo: "stock / preco",
      Obrigatorio: "Pelo menos um conforme ação selecionada",
      ValoresAceites: "Stock inteiro >= 0; Preço numérico > 0",
    },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(sampleRows),
    "Catalogo_Stock",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(guideRows),
    "Instrucoes",
  );

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="procapital-modelo-importacao-stock.xlsx"',
    },
  });
}
