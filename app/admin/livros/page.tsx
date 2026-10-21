"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { EDUCATION_LEVEL_LABELS, type EducationLevelCode } from "@/lib/enums";

interface AdminBookRow {
  id: string;
  slug: string;
  title: string;
  author: string;
  editora: string;
  isbn: string | null;
  coverUrl: string | null;
  pdfUrl: string | null;
  free: boolean;
  active: boolean;
  featured: boolean;
  allowPreorder: boolean;
  educationLevel: string | null;
  schoolGrade: string | null;
  subject: string | null;
  category: { id: string; name: string };
  prices: { currency: string; amount: string | number; marketActive: boolean }[];
}

export default function AdminLivrosPage() {
  const [books, setBooks] = useState<AdminBookRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editora, setEditora] = useState("");
  const [isbn, setIsbn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [free, setFree] = useState(false);
  const [educationLevel, setEducationLevel] = useState("");
  const [schoolGrade, setSchoolGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [priceMT, setPriceMT] = useState("950");
  const [priceKZ, setPriceKZ] = useState("9500");
  const [priceEUR, setPriceEUR] = useState("14.90");
  const [priceBRL, setPriceBRL] = useState("69.90");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/livros");
    if (!res.ok) return;
    const json = await res.json();
    setBooks(json.books ?? []);
    setCategories(json.categories ?? []);
    if (!categoryId && json.categories?.[0]?.id) {
      setCategoryId(json.categories[0].id);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/admin/livros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author,
        editora,
        isbn,
        categoryId,
        coverUrl,
        pdfUrl,
        free,
        educationLevel: educationLevel || undefined,
        schoolGrade,
        subject,
        priceMT: Number(priceMT),
        priceKZ: Number(priceKZ),
        priceEUR: Number(priceEUR),
        priceBRL: Number(priceBRL),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erro ao criar livro.");
      return;
    }
    setMessage(`Livro "${title}" registado com sucesso.`);
    setTitle("");
    setAuthor("");
    setIsbn("");
    setPdfUrl("");
    setFree(false);
    await load();
  }

  async function toggleFlag(
    book: AdminBookRow,
    field: "active" | "featured" | "allowPreorder" | "free",
  ) {
    await fetch("/api/admin/livros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: book.id,
        [field]: !book[field],
      }),
    });
    await load();
  }

  const filtered = books.filter((b) =>
    [b.title, b.author, b.editora, b.isbn]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Gestão Editorial &amp; Preços Multi-Moeda
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Livros, Capas, Metadados Escolares e Preços ({books.length})
        </h1>
      </div>

      {/* Formulário de Registo de Novo Livro */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-line bg-white p-6"
      >
        <h2 className="inline-flex items-center gap-2 font-serif text-lg font-semibold text-ink">
          <Plus size={16} className="text-brand" />
          <span>Registar Novo Livro no Catálogo</span>
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            required
            placeholder="Título da obra *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Autor *"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Editora *"
            value={editora}
            onChange={(e) => setEditora(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="text"
            placeholder="ISBN-13 ou ISBN-10 válido"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 font-mono text-xs"
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                Categoria: {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="URL da Capa (ex.: /covers/obra.jpg)"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />

          <input
            type="text"
            placeholder="URL PDF Digital (opcional, ex.: /pdfs/obra.pdf)"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />

          <label className="flex items-center gap-2 rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs font-medium text-ink">
            <input
              type="checkbox"
              checked={free}
              onChange={(e) => setFree(e.target.checked)}
              className="rounded border-line text-brand"
            />
            <span>Acesso Digital Gratuito</span>
          </label>

          <select
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          >
            <option value="">Nível de Ensino (opcional)</option>
            {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevelCode[]).map(
              (code) => (
                <option key={code} value={code}>
                  {EDUCATION_LEVEL_LABELS[code]}
                </option>
              ),
            )}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Classe (ex.: 9ª Classe)"
              value={schoolGrade}
              onChange={(e) => setSchoolGrade(e.target.value)}
              className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
            />
            <input
              type="text"
              placeholder="Disciplina"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
            />
          </div>

          <input
            type="number"
            step="0.01"
            placeholder="Preço MZN (MT)"
            value={priceMT}
            onChange={(e) => setPriceMT(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço AOA (KZ)"
            value={priceKZ}
            onChange={(e) => setPriceKZ(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço EUR (€)"
            value={priceEUR}
            onChange={(e) => setPriceEUR(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço BRL (R$)"
            value={priceBRL}
            onChange={(e) => setPriceBRL(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
        </div>

        {message && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            {message}
          </p>
        )}
        {error && <p className="mt-3 text-xs font-semibold text-red-700">{error}</p>}

        <div className="mt-4">
          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            Guardar Livro e Preços
          </button>
        </div>
      </form>

      {/* Tabela de Livros Ativos / Inativos */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Acervo Registado ({filtered.length})
          </h2>
          <input
            type="search"
            placeholder="Filtrar por título, ISBN ou editora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3.5 py-2 text-xs"
          />
        </div>

        <div className="mt-4 max-h-[480px] overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream uppercase text-ink/60">
              <tr>
                <th className="px-3 py-2.5">Título / Autor</th>
                <th className="px-3 py-2.5">Editora / Categoria</th>
                <th className="px-3 py-2.5">ISBN</th>
                <th className="px-3 py-2.5">Preços (MT / KZ / € / R$)</th>
                <th className="px-3 py-2.5">Controlos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {filtered.map((b) => {
                const pMap = Object.fromEntries(
                  b.prices.map((p) => [p.currency, Number(p.amount)]),
                );
                return (
                  <tr key={b.id}>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-ink">{b.title}</p>
                      <p className="text-ink/55">{b.author}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      {b.editora} · {b.category?.name}
                    </td>
                    <td className="px-3 py-2.5 font-mono">{b.isbn ?? "—"}</td>
                    <td className="px-3 py-2.5 font-mono">
                      {pMap.MT ?? 0} / {pMap.KZ ?? 0} / {pMap.EUR ?? 0} /{" "}
                      {pMap.BRL ?? 0}
                    </td>
                    <td className="space-x-1.5 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleFlag(b, "active")}
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          b.active
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        {b.active ? "Ativo" : "Oculto"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFlag(b, "featured")}
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          b.featured
                            ? "bg-amber-100 text-amber-900"
                            : "bg-cream text-ink/65"
                        }`}
                      >
                        Destaque
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFlag(b, "allowPreorder")}
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          b.allowPreorder
                            ? "bg-sky-100 text-sky-900"
                            : "bg-cream text-ink/65"
                        }`}
                      >
                        Pré-enc.
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFlag(b, "free")}
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          b.free
                            ? "bg-violet-100 text-violet-900"
                            : "bg-cream text-ink/65"
                        }`}
                      >
                        Digital Gratuito
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
