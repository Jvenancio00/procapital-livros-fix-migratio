import type { Metadata } from "next";
import {
  BookMarked,
  FileSpreadsheet,
  GraduationCap,
  Headphones,
  Percent,
  School,
  Store,
  Truck,
} from "lucide-react";
import ConvenioForm from "@/components/ConvenioForm";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Convénios & Parcerias Institucionais | Pro Capital",
  description:
    "Condições comerciais dedicadas para escolas, universidades, livrarias, empresas e editoras em Angola, Moçambique, Portugal e Brasil.",
};

const PUBLICOS = [
  {
    icon: School,
    title: "Escolas e Colégios",
    beneficios: [
      "Condições por volume para adoção de manuais escolares",
      "Planeamento logístico alinhado com o calendário letivo",
      "Faturação centralizada por instituição",
    ],
  },
  {
    icon: GraduationCap,
    title: "Universidades e Institutos",
    beneficios: [
      "Bibliografia técnica e científica sob encomenda recorrente",
      "Apoio a bibliotecas académicas com listas por curso",
      "Licenciamento digital para consulta institucional",
    ],
  },
  {
    icon: Store,
    title: "Livrarias e Revendedores",
    beneficios: [
      "Condições comerciais configuradas na conta B2B",
      "Reposição ágil via portal de encomenda rápida",
      "Catálogo multi-editora num único fornecedor",
    ],
  },
  {
    icon: BookMarked,
    title: "Editoras Parceiras",
    beneficios: [
      "Representação comercial em Angola, Moçambique, Portugal e Brasil",
      "Presença destacada nos catálogos digitais e PDF",
      "Gestão rigorosa de stock por armazém",
    ],
  },
] as const;

const VANTAGENS = [
  {
    icon: Percent,
    title: "Condições comerciais transparentes",
    description:
      "Descontos e escalões revistos e atribuídos pela equipa comercial de acordo com o perfil institucional.",
  },
  {
    icon: Truck,
    title: "Logística coordenada por país",
    description:
      "Expedição acompanhada desde os armazéns locais com prazos e portes claros.",
  },
  {
    icon: FileSpreadsheet,
    title: "Proformas e relatórios claros",
    description:
      "Emissão imediata de notas de encomenda e faturas proforma em PDF por mercado e moeda.",
  },
  {
    icon: Headphones,
    title: "Gestor comercial dedicado",
    description:
      "Acompanhamento direto para listas escolares anuais, bibliotecas e reposições de livraria.",
  },
] as const;

export default function ConveniosPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Acordos & Parcerias B2B"
        title="Convénios Institucionais e Comerciais"
        description="Soluções estruturadas de fornecimento recorrente para escolas, universidades, livrarias, empresas públicas/privadas e editoras."
      />

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Modalidades de Parceria
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLICOS.map(({ icon: Icon, title, beneficios }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-serif text-base font-semibold text-ink">
                {title}
              </h3>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink/70">
                {beneficios.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VANTAGENS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-cream-deep/50 p-6"
            >
              <Icon size={20} className="text-ink" />
              <h3 className="mt-3 font-serif text-base font-semibold text-ink">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-line bg-white p-7 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Apresentar Proposta de Convénio
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-ink/65">
              Preencha os dados da sua instituição ou livraria. O pedido fica
              registado na base de dados comercial da Pro Capital para análise
              pela equipa de parcerias.
            </p>
          </div>
          <div className="mt-6">
            <ConvenioForm />
          </div>
        </div>
      </section>
    </main>
  );
}
