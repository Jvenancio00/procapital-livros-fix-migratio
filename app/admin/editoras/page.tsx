"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";

interface AdminEditoraRow {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  _count?: { books: number };
}

export default function AdminEditorasPage() {
  const [editoras, setEditoras] = useState<AdminEditoraRow[]>([]);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Moçambique");
  const [logo, setLogo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/editoras");
    if (!res.ok) return;
    const json = await res.json();
    setEditoras(json.editoras ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");
    setError("");
    const res = await fetch("/api/admin/editoras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, country, logo, email, phone }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erro ao guardar editora.");
      return;
    }
    setFeedback(`Editora "${name}" guardada com sucesso.`);
    setName("");
    setLogo("");
    setEmail("");
    setPhone("");
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Rede de Representação Editorial
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Gestão de Editoras e Logótipos ({editoras.length})
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-line bg-white p-6"
      >
        <h2 className="inline-flex items-center gap-2 font-serif text-lg font-semibold text-ink">
          <Plus size={16} className="text-brand" />
          <span>Adicionar Editora Parceira</span>
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            required
            placeholder="Nome oficial da editora *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="text"
            placeholder="País (Moçambique, Angola, Portugal, Brasil)"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="text"
            placeholder="Logo em /public (ex.: /editoras/nome.jpg)"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="email"
            placeholder="Email comercial"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
          <input
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs"
          />
        </div>

        {feedback && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            {feedback}
          </p>
        )}
        {error && <p className="mt-3 text-xs font-semibold text-red-700">{error}</p>}

        <div className="mt-4">
          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            Guardar Editora
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-cream/70 uppercase text-ink/60">
              <tr>
                <th className="px-3 py-2.5">Editora</th>
                <th className="px-3 py-2.5">País</th>
                <th className="px-3 py-2.5">Logótipo</th>
                <th className="px-3 py-2.5">Contactos</th>
                <th className="px-3 py-2.5">Títulos Associados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {editoras.map((ed) => (
                <tr key={ed.id}>
                  <td className="px-3 py-2.5 font-semibold text-ink">
                    {ed.name}
                  </td>
                  <td className="px-3 py-2.5">{ed.country ?? "—"}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px]">
                    {ed.logo ?? "Bloco tipográfico"}
                  </td>
                  <td className="px-3 py-2.5 text-ink/65">
                    {[ed.email, ed.phone].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-3 py-2.5 font-semibold">
                    {ed._count?.books ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
