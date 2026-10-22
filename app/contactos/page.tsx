import type { Metadata } from "next";
import { Clock, ExternalLink, Globe2, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/PageHeader";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contactos & Parcerias",
  description:
    "Fale com a Pro Capital em Maputo (+258 87 704 6220 · comercial@procapitalmz.com). Atendimento para editoras, livrarias, escolas e leitores com resposta em até 24h úteis.",
  alternates: { canonical: `${SITE_URL}/contactos` },
  openGraph: {
    title: "Contactos & Parcerias | Pro Capital",
    description:
      "Rua Almeida Garrett, Bairro da Coop, n.º 366, Maputo — resposta comercial em até 24 horas úteis para Moçambique, Angola, Portugal e Brasil.",
    url: `${SITE_URL}/contactos`,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContactosPage() {
  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contactos & Parcerias — Pro Capital",
    url: `${SITE_URL}/contactos`,
    mainEntity: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  return (
    <div className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />

      <PageHeader
        eyebrow="Contactos & Parcerias"
        title="Fale com a equipa comercial e editorial"
        description="Editoras, livrarias, escolas, universidades, empresas ou leitores — respondemos em até 24 horas úteis para pedidos de parceria, fornecimento em volume e apoio a encomendas."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Contactos" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-line bg-white p-7">
              <h2 className="font-serif text-2xl font-semibold text-ink">
                Canais diretos Pro Capital
              </h2>
              <ul className="mt-6 space-y-5 text-sm text-ink/75">
                <li className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-brand">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                      Sede Operacional
                    </p>
                    <p className="mt-0.5 font-medium text-ink">
                      Rua Almeida Garrett, Bairro da Coop, n.º 366, Maputo, Moçambique
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-brand">
                    <Clock size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                      Prazo Oficial de Resposta
                    </p>
                    <p className="mt-0.5 font-medium text-ink">
                      Até 24 horas úteis (segunda a sexta-feira)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-brand">
                    <Globe2 size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                      Mercados Atendidos
                    </p>
                    <p className="mt-0.5 font-medium text-ink">
                      Angola (AOA) · Moçambique (MZN) · Portugal (EUR) · Brasil (BRL)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-brand">
                    <Phone size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                      Telefone / WhatsApp Comercial
                    </p>
                    <a
                      href="tel:+258877046220"
                      className="mt-0.5 inline-block font-medium text-ink hover:text-brand"
                    >
                      +258 87 704 6220
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-brand">
                    <Mail size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                      Email Institucional
                    </p>
                    <a
                      href="mailto:comercial@procapitalmz.com"
                      className="mt-0.5 inline-block font-medium text-ink hover:text-brand"
                    >
                      comercial@procapitalmz.com
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mapa e Como Chegar (Google Maps oficial) */}
            <div className="overflow-hidden rounded-2xl border border-line bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <h2 className="font-serif text-base font-semibold text-ink">
                    Mapa e como chegar
                  </h2>
                  <p className="text-xs text-ink/60">
                    Bairro da Coop, Rua Almeida Garrett n.º 366 · Maputo
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Rua+Almeida+Garrett+366+Bairro+da+Coop+Maputo+Mo%C3%A7ambique"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-brand hover:border-brand/40"
                >
                  <span>Abrir mapa</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="overflow-hidden rounded-xl border border-line/80">
                <iframe
                  title="Localização da Pro Capital em Maputo"
                  src="https://www.google.com/maps?q=Rua+Almeida+Garrett+366+Bairro+da+Coop+Maputo+Mo%C3%A7ambique&output=embed"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-line bg-white p-7 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
