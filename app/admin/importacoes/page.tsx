"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import type { ImportPreviewSummary } from "@/lib/excel-import";

interface BatchHistoryItem {
  id: string;
  filename: string;
  mode: string;
  totalRows: number;
  processedRows: number;
  createdBooks: number;
  updatedStock: number;
  updatedPrices: number;
  errorRows: number;
  actorEmail: string | null;
  createdAt: string;
}

export default function AdminImportacoesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [updateStock, setUpdateStock] = useState(true);
  const [updatePrices, setUpdatePrices] = useState(true);
  const [importNewBooks, setImportNewBooks] = useState(true);
  const [preview, setPreview] = useState<ImportPreviewSummary | null>(null);
  const [commitResult, setCommitResult] = useState<Record<string, unknown> | null>(
    null,
  );
  const [batches, setBatches] = useState<BatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    const res = await fetch("/api/admin/importacoes");
    if (res.ok) {
      const json = await res.json();
      setBatches(json.batches ?? []);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleStep(step: "preview" | "commit") {
    if (!file) {
      setError("Selecione primeiro um ficheiro .xlsx ou .csv.");
      return;
    }
    setLoading(true);
    setError("");
    if (step === "preview") setCommitResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("step", step);
      fd.append("updateStock", String(updateStock));
      fd.append("updatePrices", String(updatePrices));
      fd.append("importNewBooks", String(importNewBooks));

      const res = await fetch("/api/admin/importacoes", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro no processamento do ficheiro.");
        return;
      }

      if (step === "preview") {
        setPreview(json.preview);
      } else {
        setCommitResult(json.result);
        setPreview(null);
        await loadHistory();
      }
    } catch {
      setError("Falha de comunicação ao processar ficheiro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Automação de Catálogo &amp; Inventário
          </span>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
            Importação de Stock, Preços e Livros via Excel / CSV
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink/65">
            Fluxo seguro em duas fases: validação e pré-visualização linha a linha
            (correspondência prioritária por ISBN-10/ISBN-13, deteção de duplicados e
            erros) antes de qualquer escrita na base de dados.
          </p>
        </div>

        <a
          href="/api/admin/importacoes?template=1"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand"
        >
          <Download size={14} />
          <span>Baixar Modelo Oficial (.xlsx)</span>
        </a>
      </div>

      {/* Passo 1 & Escopo */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">
          1. Carregar Ficheiro (.xlsx ou .csv) e Definir Operações Autorizadas
        </h2>

        <div className="mt-4 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-cream/50 p-6 text-center transition-colors hover:border-brand/50">
              <Upload size={22} className="text-brand" />
              <span className="mt-2 text-xs font-semibold text-ink">
                {file ? file.name : "Clique para selecionar ficheiro .xlsx ou .csv"}
              </span>
              <span className="mt-1 text-[11px] text-ink/55">
                Colunas suportadas: ISBN, Título, Autor, Editora, Categoria, País,
                Moeda, Armazém, Quantidade, Preço, Nível, Classe, Disciplina
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setPreview(null);
                  setCommitResult(null);
                }}
                className="sr-only"
              />
            </label>
          </div>

          <div className="flex flex-col justify-between space-y-3 lg:col-span-6">
            <div className="space-y-2.5 text-xs">
              <p className="font-semibold uppercase tracking-wider text-ink/60">
                Selecione exatamente o que deseja executar:
              </p>

              <label className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-cream/30 px-3.5 py-2.5 font-medium text-ink">
                <input
                  type="checkbox"
                  checked={updateStock}
                  onChange={(e) => setUpdateStock(e.target.checked)}
                  className="accent-brand"
                />
                <span>Atualizar quantidades de stock por país / armazém</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-cream/30 px-3.5 py-2.5 font-medium text-ink">
                <input
                  type="checkbox"
                  checked={updatePrices}
                  onChange={(e) => setUpdatePrices(e.target.checked)}
                  className="accent-brand"
                />
                <span>Atualizar preços comerciais oficiais por moeda</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-cream/30 px-3.5 py-2.5 font-medium text-ink">
                <input
                  type="checkbox"
                  checked={importNewBooks}
                  onChange={(e) => setImportNewBooks(e.target.checked)}
                  className="accent-brand"
                />
                <span>Importar novos livros não existentes no catálogo</span>
              </label>
            </div>

            <div>
              <button
                type="button"
                disabled={loading || !file}
                onClick={() => handleStep("preview")}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-xs font-semibold text-white hover:bg-ink/90 disabled:opacity-45"
              >
                <FileSpreadsheet size={14} />
                <span>
                  {loading
                    ? "A analisar ficheiro..."
                    : "Pré-visualizar e Validar Alterações"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
      </div>

      {/* Passo 2: Pré-visualização Detalhada Antes de Confirmar */}
      {preview && (
        <div className="space-y-4 rounded-2xl border border-brand/40 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                2. Resumo da Pré-Visualização ({preview.filename})
              </span>
              <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
                Verifique os dados antes de confirmar a execução
              </h2>
            </div>

            <button
              type="button"
              disabled={loading || preview.validRows === 0}
              onClick={() => handleStep("commit")}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-45"
            >
              <CheckCircle2 size={15} />
              <span>Confirmar e Executar Importação Agora</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <div className="rounded-xl bg-cream p-3 text-xs">
              <p className="text-ink/55">Total linhas</p>
              <p className="mt-1 font-serif text-xl font-bold">{preview.totalRows}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
              <p>ISBNs encontrados</p>
              <p className="mt-1 font-serif text-xl font-bold">
                {preview.matchedExisting}
              </p>
            </div>
            <div className="rounded-xl bg-sky-50 p-3 text-xs text-sky-900">
              <p>Novos livros</p>
              <p className="mt-1 font-serif text-xl font-bold">
                {preview.newBooksCount}
              </p>
            </div>
            <div className="rounded-xl bg-cream p-3 text-xs">
              <p className="text-ink/55">Stock / Preços</p>
              <p className="mt-1 font-serif text-xl font-bold">
                {preview.proposedStockUpdates} / {preview.proposedPriceUpdates}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
              <p>Duplicados / Ignorados</p>
              <p className="mt-1 font-serif text-xl font-bold">
                {preview.duplicateCount + preview.unmatchedCount}
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-900">
              <p>Com erro</p>
              <p className="mt-1 font-serif text-xl font-bold">
                {preview.errorCount}
              </p>
            </div>
          </div>

          <div className="max-h-96 overflow-auto rounded-xl border border-line">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-cream text-[11px] uppercase text-ink/60">
                <tr>
                  <th className="px-3 py-2.5">Linha</th>
                  <th className="px-3 py-2.5">ISBN Normalizado</th>
                  <th className="px-3 py-2.5">Título / Correspondência</th>
                  <th className="px-3 py-2.5">Estado</th>
                  <th className="px-3 py-2.5">Alterações / Avisos / Erros</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {preview.rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td className="px-3 py-2 font-mono">{row.rowNumber}</td>
                    <td className="px-3 py-2 font-mono">
                      {row.isbnNormalized ?? row.rawIsbn ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-medium text-ink">
                      {row.matchedBookTitle ?? row.title ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-semibold">{row.status}</td>
                    <td className="px-3 py-2 text-ink/70">
                      {[
                        ...row.proposedChanges,
                        ...row.warnings,
                        ...row.errors,
                      ].join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resultado Final da Execução */}
      {commitResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-xs text-emerald-950">
          <p className="font-serif text-lg font-semibold">
            Importação concluída e auditada com sucesso!
          </p>
          <p className="mt-1">
            Novos livros: <strong>{String(commitResult.createdBooks ?? 0)}</strong> ·
            Stocks atualizados:{" "}
            <strong>{String(commitResult.updatedStock ?? 0)}</strong> · Preços
            atualizados: <strong>{String(commitResult.updatedPrices ?? 0)}</strong> ·
            Linhas com erro: <strong>{String(commitResult.errorRows ?? 0)}</strong>
          </p>
        </div>
      )}

      {/* Histórico Completo de Importações com Exportação de Relatório */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Histórico de Importações Registadas
          </h2>
          <a
            href="/api/admin/importacoes/modelo"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/60 px-4 py-1.5 text-xs font-semibold text-ink hover:border-brand/40"
          >
            <Download size={13} />
            <span>Descarregar modelo Excel (.xlsx)</span>
          </a>
        </div>

        {batches.length === 0 ? (
          <p className="mt-3 text-xs text-ink/60">
            Nenhuma importação executada até ao momento.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-cream/70 uppercase text-ink/60">
                <tr>
                  <th className="px-3 py-2.5">Data</th>
                  <th className="px-3 py-2.5">Ficheiro</th>
                  <th className="px-3 py-2.5">Modo</th>
                  <th className="px-3 py-2.5">Processadas</th>
                  <th className="px-3 py-2.5">Novos / Stock / Preços</th>
                  <th className="px-3 py-2.5">Operador</th>
                  <th className="px-3 py-2.5 text-right">Relatório</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td className="px-3 py-2.5">
                      {new Date(b.createdAt).toLocaleString("pt-PT")}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-ink">
                      {b.filename}
                    </td>
                    <td className="px-3 py-2.5">{b.mode}</td>
                    <td className="px-3 py-2.5">
                      {b.processedRows}/{b.totalRows} (erros: {b.errorRows})
                    </td>
                    <td className="px-3 py-2.5">
                      {b.createdBooks} / {b.updatedStock} / {b.updatedPrices}
                    </td>
                    <td className="px-3 py-2.5">{b.actorEmail ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/api/admin/importacoes/${b.id}/relatorio`}
                          className="font-semibold text-brand hover:underline"
                        >
                          .xlsx
                        </a>
                        <span className="text-ink/30">·</span>
                        <a
                          href={`/api/admin/importacoes/${b.id}/relatorio?formato=csv`}
                          className="font-semibold text-ink/70 hover:underline"
                        >
                          .csv
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
