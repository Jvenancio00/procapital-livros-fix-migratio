"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun, Bookmark, StickyNote, Trash2, Minus, Plus, ArrowLeft } from "lucide-react";

interface Note {
  id: string;
  page: number;
  kind: "BOOKMARK" | "NOTE";
  content: string | null;
}

export default function ReaderClient({
  bookSlug,
  title,
  pdfUrl,
  licenseExpired,
}: {
  bookSlug: string;
  title: string;
  pdfUrl: string | null;
  licenseExpired: boolean;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    fetch(`/api/leitor/${bookSlug}/notas`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setNotes)
      .catch(() => {});
  }, [bookSlug]);

  const addNote = async (kind: "BOOKMARK" | "NOTE") => {
    const res = await fetch(`/api/leitor/${bookSlug}/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: currentPage, kind, content: kind === "NOTE" ? noteText : null }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [...prev, note]);
      setNoteText("");
    }
  };

  const removeNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/leitor/${bookSlug}/notas`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  if (licenseExpired) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="font-serif text-xl font-semibold text-ink">Licença expirada</p>
        <p className="mt-2 text-sm text-foreground/60">
          A licença de leitura deste livro já não é válida. Contacte-nos para renovar.
        </p>
        <Link href="/loja/biblioteca" className="mt-6 inline-block text-sm text-brand hover:underline">
          Voltar à biblioteca
        </Link>
      </div>
    );
  }

  return (
    <div className={darkMode ? "min-h-screen bg-ink text-cream" : "min-h-screen bg-cream text-ink"}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/30 px-5 py-3">
        <Link href="/loja/biblioteca" className="flex items-center gap-1.5 text-sm hover:underline">
          <ArrowLeft size={15} /> Biblioteca
        </Link>
        <h1 className="truncate font-serif text-sm font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setFontScale((s) => Math.max(0.75, s - 0.1))} className="rounded-full border border-line/40 p-1.5" aria-label="Diminuir letra">
            <Minus size={14} />
          </button>
          <button onClick={() => setFontScale((s) => Math.min(1.6, s + 0.1))} className="rounded-full border border-line/40 p-1.5" aria-label="Aumentar letra">
            <Plus size={14} />
          </button>
          <button onClick={() => setDarkMode((d) => !d)} className="rounded-full border border-line/40 p-1.5" aria-label="Alternar modo escuro">
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => addNote("BOOKMARK")} className="flex items-center gap-1 rounded-full border border-line/40 px-3 py-1.5 text-xs">
            <Bookmark size={13} /> Marcar página {currentPage}
          </button>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1fr_280px]">
        <div style={{ fontSize: `${fontScale}rem` }} className="rounded-2xl border border-line/30 bg-white/90 p-2">
          {pdfUrl ? (
            <iframe src={pdfUrl} title={title} className="h-[80vh] w-full rounded-xl" />
          ) : (
            <p className="p-10 text-center text-sm text-foreground/60">
              Este livro ainda não tem um ficheiro associado para leitura.
            </p>
          )}
          <div className="mt-2 flex items-center justify-center gap-3 text-xs">
            <span>Página:</span>
            <input
              type="number"
              min={1}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value) || 1)}
              className="w-16 rounded-lg border border-line/40 px-2 py-1 text-center"
            />
            <span className="text-foreground/50">(navegação real de páginas depende do visualizador do browser)</span>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-line/30 p-4">
            <h2 className="flex items-center gap-1.5 font-serif text-sm font-semibold">
              <StickyNote size={14} /> Nova nota (página {currentPage})
            </h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-line/40 bg-transparent px-2 py-1.5 text-xs"
              placeholder="Escreve uma nota sobre esta página..."
            />
            <button
              onClick={() => addNote("NOTE")}
              disabled={!noteText.trim()}
              className="mt-2 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-cream disabled:opacity-40"
            >
              Guardar nota
            </button>
          </div>

          <div className="rounded-2xl border border-line/30 p-4">
            <h2 className="font-serif text-sm font-semibold">Marcadores e notas</h2>
            <ul className="mt-2 space-y-2 text-xs">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-2 border-b border-line/20 pb-2">
                  <button onClick={() => setCurrentPage(n.page)} className="text-left hover:text-brand">
                    <span className="font-semibold">Pág. {n.page}</span>{" "}
                    {n.kind === "BOOKMARK" ? "· marcador" : `· ${n.content}`}
                  </button>
                  <button onClick={() => removeNote(n.id)} aria-label="Remover">
                    <Trash2 size={13} className="text-foreground/40 hover:text-red-500" />
                  </button>
                </li>
              ))}
              {notes.length === 0 && <li className="text-foreground/50">Sem marcadores ainda.</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
