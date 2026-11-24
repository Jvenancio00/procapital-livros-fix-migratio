"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SOLUTIONS = [
  {
    profile: "Livrarias & Revendedores",
    title: "Reposição ágil e margens de revenda multi-editora",
    description:
      "Consolide encomendas de múltiplas chancelas escolares, literárias e infantis numa única fatura comercial, com stock real por armazém e histórico de reposição.",
    highlights: ["Desconto comercial B2B sujeito a aprovação", "Repetição rápida de encomendas", "Catálogo PDF atualizado por mercado"],
    cta: "Abrir conta de livraria",
    href: "/loja/registo?perfil=LIVRARIA",
  },
  {
    profile: "Escolas & Universidades",
    title: "Fornecimento estruturado para o ano letivo",
    description:
      "Seleção completa por país, nível de ensino (primário, secundário, técnico e superior), classe e disciplina, com pedidos de cotação em lote e convénios institucionais.",
    highlights: ["Encomendas em quantidade por classe", "Proposta proforma e faturação fiscal", "Apoio dedicado à época escolar"],
    cta: "Pedir cotação escolar",
    href: "/cotacoes?perfil=ESCOLA",
  },
  {
    profile: "Editoras & Chancelas",
    title: "Representação comercial em Angola, Moçambique, Portugal e Brasil",
    description:
      "Integre o seu catálogo na rede de distribuição Pro Capital com atualização automática de stock por Excel/CSV, visibilidade editorial e presença em feiras.",
    highlights: ["Importação de tabelas por ISBN", "Controlo independente por país e moeda", "Divulgação editorial e eventos"],
    cta: "Solicitar parceria editorial",
    href: "/contactos?motivo=PARCERIA",
  },
  {
    profile: "Empresas, ONGs & Instituições",
    title: "Projetos de leitura, bibliotecas e programas educativos",
    description:
      " Curadoria de acervos literários, técnicos e pedagógicos para bibliotecas escolares, projetos sociais, fundações e programas de responsabilidade corporativa.",
    highlights: ["Curadoria por faixa etária e tema", "Logística coordenada para províncias", "Condições contratuais transparentes"],
    cta: "Conhecer convénios",
    href: "/convenios",
  },
];

export default function AudienceSection() {
  return (
    <section className="border-y border-line/80 bg-cream-deep/45 py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <h2 className="mt-2.5 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Estrutura pensada para quem compra, ensina e publica
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/70">
            Cada perfil comprador dispõe de fluxos próprios de consulta, encomenda em
            volume, pedido de cotação e acompanhamento logístico.
          </p>
        </div>

        <div className="mt-11">
          {SOLUTIONS.map((item, index) => {
            return (
              <article
                key={item.profile}
                className="grid gap-5 border-t border-line py-8 md:grid-cols-[4rem_1fr]"
              >
                <span aria-hidden="true" className="font-serif text-xl text-brand">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{item.profile}</p>

                  <h3 className="mt-3.5 font-serif text-2xl font-semibold leading-snug text-ink">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {item.description}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-line/70 pt-4 text-xs text-ink/75">
                    {item.highlights.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                <div className="mt-6 pt-2">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
