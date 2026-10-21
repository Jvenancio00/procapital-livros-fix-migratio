"use client";

import { useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import {
  EDUCATION_LEVEL_LABELS,
  type EducationLevelCode,
  type MarketCode,
} from "@/lib/enums";
import { MARKET_LIST } from "@/lib/markets";

export default function AdminCatalogosPdfPage() {
  const [market, setMarket] = useState<MarketCode>("MZ");
  const [category, setCategory] = useState("");
  const [publisher, setPublisher] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [availability, setAvailability] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const pdfUrl = useMemo(() => {
    const p = new URLSearchParams({ pais: market });
    if (category) p.set("categoria", category);
    if (publisher.trim()) p.set("editora", publisher.trim());
    if (educationLevel) p.set("nivelEnsino", educationLevel);
    if (availability) p.set("disponibilidade", availability);
    if (minPrice) p.set("precoMin", minPrice);
    if (maxPrice) p.set("precoMax", maxPrice);
    return `/api/catalogo/pdf?${p.toString()}`;
  }, [
    market,
    category,
    publisher,
    educationLevel,
    availability,
    minPrice,
    maxPrice,
  ]);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Exportação Editorial &amp; Comercial
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Gerador de Catálogos em PDF Personalizados
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink/65">
          Gere catálogos profissionais com identidade visual Pro Capital, capas
          reais dos livros, ISBN, autor, editora, disponibilidade e preços oficiais
          do mercado selecionado.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-ink/75">
              País / Moeda Alvo
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as MarketCode)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs font-semibold"
            >
              {MARKET_LIST.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name} ({m.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/75">
              Categoria Editorial
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs"
            >
              <option value="">Todas as categorias</option>
              <option value="Escolar">Escolar</option>
              <option value="Infantil">Infantil</option>
              <option value="Ficção">Ficção</option>
              <option value="Não-ficção">Não-ficção</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/75">
              Editora Específica (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex.: Plural Editores / Alcance Editores"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/75">
              Nível de Ensino
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs"
            >
              <option value="">Todos os níveis</option>
              {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevelCode[]).map(
                (lvl) => (
                  <option key={lvl} value={lvl}>
                    {EDUCATION_LEVEL_LABELS[lvl]}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/75">
              Disponibilidade Comercial
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs"
            >
              <option value="">Todos os títulos ativos</option>
              <option value="DISPONIVEL">Apenas disponíveis em stock</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Preço Mín.
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Preço Máx.
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <code className="rounded-lg bg-cream px-3 py-1.5 text-[11px] text-ink/70">
            {pdfUrl}
          </code>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white hover:bg-brand-dark"
          >
            <FileDown size={15} />
            <span>Gerar e Descarregar Catálogo PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
}
