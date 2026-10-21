import type { Metadata } from "next";
import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Contactos & Parcerias | Pro Capital",
  description:
    "Fale com a Pro Capital — distribuidora de livros para editoras, livrarias, escolas e instituições em Angola, Moçambique, Portugal e Brasil.",
};

export default function ContactosPage() {
  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Contactos & Parcerias"
        title="Fale com a equipa comercial e editorial"
        description="Editoras, livrarias, escolas, universidades, empresas ou leitores — tratamos pedidos de parceria, fornecimento em volume e apoio a encomendas."
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
                      Rua Almeida Garrett, Bairro da Coop, n.º 366, Maputo
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
