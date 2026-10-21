"use client";

import Link from "next/link";
import { ArrowUpRight, FileDown } from "lucide-react";
import Logo from "./Logo";
import { useLanguage } from "@/context/LanguageContext";
import { MARKET_LIST } from "@/lib/markets";

export default function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              {dict.footer.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {MARKET_LIST.map((m) => (
                <a
                  key={m.code}
                  href={`/api/catalogo/pdf?pais=${m.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/85 transition-colors hover:border-accent/60 hover:text-accent"
                >
                  <FileDown size={12} aria-hidden="true" />
                  <span>
                    PDF {m.name} ({m.currency})
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {dict.footer.navigationTitle}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/livros-escolares" className="hover:text-white">
                  Livros Escolares (1.ª à 12.ª Classe)
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white">
                  Catálogo Geral Multi-Mercado
                </Link>
              </li>
              <li>
                <Link href="/editoras" className="hover:text-white">
                  Editoras e Chancelas Parceiras
                </Link>
              </li>
              <li>
                <Link href="/destaques" className="hover:text-white">
                  Destaques Editoriais
                </Link>
              </li>
              <li>
                <Link href="/mais-vendidos" className="hover:text-white">
                  Mais Vendidos
                </Link>
              </li>
              <li>
                <Link href="/livro/livro-gratuito" className="hover:text-white">
                  {dict.nav.digitalBook}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Soluções B2B &amp; Conta
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/cotacoes" className="hover:text-white">
                  Pedidos de Cotação &amp; Volume
                </Link>
              </li>
              <li>
                <Link href="/convenios" className="hover:text-white">
                  Convénios Escolares &amp; Institucionais
                </Link>
              </li>
              <li>
                <Link href="/cliente/catalogo" className="hover:text-white">
                  Catálogo Comercial B2B
                </Link>
              </li>
              <li>
                <Link href="/loja/conta" className="hover:text-white">
                  Área de Cliente &amp; Encomendas
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="hover:text-white">
                  Eventos &amp; Feiras do Livro
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  {dict.nav.blog}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {dict.footer.contactsTitle}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>Rua Almeida Garrett n.º 366, Maputo</li>
              <li>Angola · Moçambique · Portugal · Brasil</li>
              <li>
                <a
                  href="mailto:comercial@procapitalmz.com"
                  className="hover:text-white"
                >
                  comercial@procapitalmz.com
                </a>
              </li>
              <li>+258 87 704 6220</li>
              <li className="pt-2">
                <Link
                  href="/contactos?motivo=PARCERIA"
                  className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                >
                  <span>Solicitar parceria editorial</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>{dict.footer.rights}</p>
          <p>
            Distribuição Editorial Multi-Mercado · Preços e disponibilidade sujeitos ao
            stock de cada país
          </p>
        </div>
      </div>
    </footer>
  );
}
