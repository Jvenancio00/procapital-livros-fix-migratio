import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Mail, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Pedido Recebido — Obrigado",
  description:
    "Confirmação de receção do seu contacto, pedido de cotação ou encomenda na Pro Capital.",
  robots: { index: false, follow: false },
};

const CONTENT_BY_ORIGIN: Record<
  string,
  { eyebrow: string; title: string; body: string }
> = {
  contacto: {
    eyebrow: "Contacto Registado",
    title: "Obrigado pelo seu contacto",
    body: "A sua mensagem foi registada junto da equipa comercial e editorial da Pro Capital. Respondemos em até 24 horas úteis (segunda a sexta-feira).",
  },
  cotacao: {
    eyebrow: "Cotação B2B Registada",
    title: "Pedido de cotação em análise comercial",
    body: "Recebemos a sua lista e validaremos stock por armazém, prazos e proposta proforma em até 24 horas úteis (segunda a sexta-feira).",
  },
  encomenda: {
    eyebrow: "Encomenda Registada",
    title: "Obrigado pela sua encomenda",
    body: "A sua encomenda ficou registada com reserva de stock. Consulte os detalhes e o documento proforma na sua área de encomendas.",
  },
};

export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ origem?: string; ref?: string }>;
}) {
  const params = await searchParams;
  const key = (params.origem ?? "contacto").toLowerCase();
  const copy = CONTENT_BY_ORIGIN[key] ?? CONTENT_BY_ORIGIN.contacto;

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.body}
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Confirmação" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="rounded-3xl border border-line bg-white p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={24} />
            </span>
            <div>
              {params.ref && (
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-brand">
                  Referência: {params.ref}
                </p>
              )}
              <h2 className="mt-1 font-serif text-xl font-semibold text-ink sm:text-2xl">
                Compromisso de acompanhamento Pro Capital
              </h2>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink/75">
                <Clock size={14} className="text-brand" />
                <span>Respondemos em até 24 horas úteis (segunda a sexta-feira).</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-line/80 bg-cream/55 p-4 text-xs text-ink/75 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-brand" />
              <a href="tel:+258877046220" className="font-medium hover:text-brand">
                +258 87 704 6220
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-brand" />
              <a
                href="mailto:comercial@procapitalmz.com"
                className="font-medium hover:text-brand"
              >
                comercial@procapitalmz.com
              </a>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <span>Continuar no catálogo</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/livros-escolares"
              className="inline-flex items-center rounded-full border border-line bg-white px-6 py-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40"
            >
              <span>Livros Escolares</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-line bg-cream px-5 py-3 text-xs font-semibold text-ink/80 transition-colors hover:border-brand/40"
            >
              <span>Página Inicial</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
