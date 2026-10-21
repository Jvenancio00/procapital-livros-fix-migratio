"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Download,
  ExternalLink,
  FileDown,
  Minus,
  Moon,
  Plus,
  StickyNote,
  Sun,
  Trash2,
} from "lucide-react";

export interface DigitalEditionOption {
  id: string;
  label: string;
  subtitle: string;
  pdfUrl: string;
  downloadName?: string;
  bookSlug?: string;
}

interface LocalReaderNote {
  id: string;
  editionId: string;
  page: number;
  kind: "BOOKMARK" | "NOTE";
  content: string | null;
  createdAt: string;
}

const STORAGE_KEY = "procapital-digital-reader-notes-v1";

const OFFICIAL_CATALOG_EDITIONS: DigitalEditionOption[] = [
  {
    id: "catalogo-ao",
    label: "Catálogo Angola (KZ)",
    subtitle: "Edição PDF oficial em Kwanzas · Stock Luanda",
    pdfUrl: "/api/catalogo/pdf?pais=AO",
    downloadName: "procapital-catalogo-angola-kz.pdf",
  },
  {
    id: "catalogo-mz",
    label: "Catálogo Moçambique (MT)",
    subtitle: "Edição PDF oficial em Meticais · Stock Maputo",
    pdfUrl: "/api/catalogo/pdf?pais=MZ",
    downloadName: "procapital-catalogo-mocambique-mt.pdf",
  },
  {
    id: "catalogo-pt",
    label: "Catálogo Portugal (€)",
    subtitle: "Edição PDF oficial em Euros · Distribuição Lisboa",
    pdfUrl: "/api/catalogo/pdf?pais=PT",
    downloadName: "procapital-catalogo-portugal-eur.pdf",
  },
  {
    id: "catalogo-br",
    label: "Catálogo Brasil (R$)",
    subtitle: "Edição PDF oficial em Reais · Distribuição São Paulo",
    pdfUrl: "/api/catalogo/pdf?pais=BR",
    downloadName: "procapital-catalogo-brasil-brl.pdf",
  },
  {
    id: "catalogo-escolar",
    label: "Caderno Escolar",
    subtitle: "Manuais e cadernos de exercícios (1.ª à 12.ª Classe)",
    pdfUrl: "/api/catalogo/pdf?categoria=Escolar",
    downloadName: "procapital-caderno-escolar.pdf",
  },
];

export default function DigitalWorkspaceClient({
  bookEditions = [],
  isAuthenticated = false,
}: {
  bookEditions?: DigitalEditionOption[];
  isAuthenticated?: boolean;
}) {
  const editions = useMemo(
    () => [...bookEditions, ...OFFICIAL_CATALOG_EDITIONS],
    [bookEditions],
  );

  const [selectedId, setSelectedId] = useState<string>(editions[0]?.id ?? "catalogo-ao");
  const [darkMode, setDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<LocalReaderNote[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNotes(parsed);
      }
    } catch {
      // ignora armazenamento indisponível
    }
  }, []);

  const persistNotes = (next: LocalReaderNote[]) => {
    setNotes(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignora armazenamento indisponível
    }
  };

  const activeEdition =
    editions.find((e) => e.id === selectedId) ?? editions[0]!;

  const activeNotes = notes.filter((n) => n.editionId === activeEdition.id);

  function handleAddNote(kind: "BOOKMARK" | "NOTE") {
    if (kind === "NOTE" && !noteText.trim()) return;
    const entry: LocalReaderNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      editionId: activeEdition.id,
      page: currentPage,
      kind,
      content: kind === "NOTE" ? noteText.trim() : null,
      createdAt: new Date().toISOString(),
    };
    persistNotes([...notes, entry]);
    if (kind === "NOTE") setNoteText("");
  }

  function handleRemoveNote(id: string) {
    persistNotes(notes.filter((n) => n.id !== id));
  }

  const viewerSrc = `${activeEdition.pdfUrl}#page=${currentPage}`;

  return (
    <div
      className={`rounded-3xl border transition-colors ${
        darkMode
          ? "border-white/15 bg-ink text-cream"
          : "border-line bg-white text-ink shadow-sm"
      }`}
    >
      {/* Seletor de Documento / Edição Digital */}
      <div
        className={`border-b px-5 py-4 sm:px-7 ${
          darkMode ? "border-white/10" : "border-line/80 bg-cream/45"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Leitor Digital Integrado Pro Capital
            </span>
            <h2 className="mt-0.5 font-serif text-xl font-semibold sm:text-2xl">
              Consulta Online de Edições &amp; Catálogos PDF Oficiais
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={activeEdition.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                darkMode
                  ? "border-white/20 text-white hover:border-accent"
                  : "border-line bg-white text-ink hover:border-brand/40"
              }`}
            >
              <ExternalLink size={13} />
              <span>Abrir em nova aba</span>
            </a>

            <a
              href={activeEdition.pdfUrl}
              download={activeEdition.downloadName}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Download size={13} />
              <span>Descarregar PDF</span>
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {editions.map((ed) => {
            const active = ed.id === activeEdition.id;
            return (
              <button
                key={ed.id}
                type="button"
                onClick={() => {
                  setSelectedId(ed.id);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-brand bg-brand text-white"
                    : darkMode
                    ? "border-white/15 bg-white/5 text-white/80 hover:border-accent/60"
                    : "border-line bg-white text-ink/80 hover:border-brand/40 hover:text-brand"
                }`}
              >
                <FileDown size={12} aria-hidden="true" />
                <span>{ed.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Ferramentas de Leitura */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 text-xs sm:px-7 ${
          darkMode ? "border-white/10" : "border-line/70"
        }`}
      >
        <div>
          <p className="font-semibold">{activeEdition.label}</p>
          <p className={darkMode ? "text-white/65" : "text-ink/60"}>
            {activeEdition.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-1">
            <span>Página:</span>
            <input
              type="number"
              min={1}
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.max(1, Number(e.target.value) || 1))}
              aria-label="Número da página"
              className="w-12 bg-transparent text-center font-semibold focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setFontScale((s) => Math.max(0.85, Number((s - 0.1).toFixed(2))))}
            aria-label="Diminuir tamanho das notas"
            className="rounded-full border border-current/20 p-1.5 hover:border-brand"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={() => setFontScale((s) => Math.min(1.35, Number((s + 0.1).toFixed(2))))}
            aria-label="Aumentar tamanho das notas"
            className="rounded-full border border-current/20 p-1.5 hover:border-brand"
          >
            <Plus size={13} />
          </button>

          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Alternar modo de contraste"
            className="inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-1.5 font-medium hover:border-brand"
          >
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            <span>{darkMode ? "Modo claro" : "Modo escuro"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddNote("BOOKMARK")}
            className="inline-flex items-center gap-1.5 rounded-full border border-current/20 px-3 py-1.5 font-medium hover:border-brand"
          >
            <Bookmark size={13} />
            <span>Marcar pág. {currentPage}</span>
          </button>

          {activeEdition.bookSlug && (
            <Link
              href={`/loja/leitor/${activeEdition.bookSlug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-semibold text-ink"
            >
              <BookOpen size={13} />
              <span>Abrir na Minha Biblioteca</span>
            </Link>
          )}
        </div>
      </div>

      {/* Área Principal: Visualizador PDF + Caderno de Notas */}
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl border border-line/60 bg-cream/40">
          <iframe
            key={viewerSrc}
            src={viewerSrc}
            title={activeEdition.label}
            className="h-[68vh] min-h-[460px] w-full bg-white"
          />
        </div>

        <aside
          style={{ fontSize: `${fontScale}rem` }}
          className="flex flex-col justify-between gap-4"
        >
          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-4 ${
                darkMode ? "border-white/15 bg-white/5" : "border-line bg-cream/35"
              }`}
            >
              <h3 className="flex items-center gap-1.5 font-serif text-sm font-semibold">
                <StickyNote size={14} className="text-brand" />
                <span>Nova anotação · Página {currentPage}</span>
              </h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                placeholder="Registe observações de leitura, ISBN ou quantidades para cotação..."
                className={`mt-2.5 w-full rounded-xl border p-2.5 text-xs focus:outline-none ${
                  darkMode
                    ? "border-white/20 bg-ink text-cream placeholder:text-white/40"
                    : "border-line bg-white text-ink placeholder:text-ink/45"
                }`}
              />
              <button
                type="button"
                onClick={() => handleAddNote("NOTE")}
                disabled={!noteText.trim()}
                className="mt-2.5 w-full rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
              >
                Guardar nota nesta página
              </button>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                darkMode ? "border-white/15 bg-white/5" : "border-line bg-white"
              }`}
            >
              <h3 className="font-serif text-sm font-semibold">
                Marcadores &amp; Notas ({activeNotes.length})
              </h3>
              {activeNotes.length === 0 ? (
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    darkMode ? "text-white/60" : "text-ink/55"
                  }`}
                >
                  Nenhum marcador registado neste documento. Use «Marcar pág.» ou
                  adicione uma nota para testar a consulta guiada.
                </p>
              ) : (
                <ul className="mt-3 max-h-56 space-y-2.5 overflow-auto text-xs">
                  {activeNotes.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-2 border-b border-current/10 pb-2"
                    >
                      <button
                        type="button"
                        onClick={() => setCurrentPage(item.page)}
                        className="text-left hover:text-brand"
                      >
                        <span className="font-semibold">Pág. {item.page}</span>
                        {item.kind === "BOOKMARK"
                          ? " · Marcador rápido"
                          : ` · ${item.content}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveNote(item.id)}
                        aria-label="Eliminar registo"
                        className="opacity-60 hover:text-red-500 hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 text-xs leading-relaxed ${
              darkMode
                ? "border-white/15 bg-white/5 text-white/75"
                : "border-line/80 bg-cream/60 text-ink/70"
            }`}
          >
            {isAuthenticated ? (
              <p>
                Sessão iniciada: as obras adquiridas ou gratuitas na sua conta
                sincronizam notas permanentemente na base de dados em{" "}
                <Link
                  href="/loja/biblioteca"
                  className="font-semibold text-brand underline"
                >
                  A Minha Biblioteca
                </Link>
                .
              </p>
            ) : (
              <p>
                As notas acima ficam guardadas neste navegador.{" "}
                <Link
                  href="/loja/entrar?callbackUrl=/livro-digital"
                  className="font-semibold text-brand underline"
                >
                  Inicie sessão
                </Link>{" "}
                ou{" "}
                <Link
                  href="/loja/registo"
                  className="font-semibold text-brand underline"
                >
                  crie conta
                </Link>{" "}
                para sincronizar a sua Biblioteca Digital em qualquer dispositivo.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
