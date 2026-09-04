import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contactos | Pro Capital",
  description:
    "Fale com a Pro Capital — distribuidora de livros para livrarias, escolas e público em geral em Moçambique e nos países da CPLP.",
};

export default function ContactosPage() {
  return (
    <div>
      <section className="border-b border-line bg-cream-deep/60">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
          <span className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
            Contactos
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Vamos falar sobre livros.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Seja uma livraria, uma escola ou um leitor, a nossa equipa está
            disponível para ajudar a encontrar os títulos certos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <h2 className="font-serif text-xl font-semibold text-ink">
              Informações de contacto
            </h2>
            <ul className="mt-6 space-y-5 text-sm text-foreground/70">
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <MapPin size={18} />
                </span>
                <span className="pt-2">
                  Rua Gil Vicente, n.º 79, R/C, Bairro Coop
                  <br />
                  Distrito de Kampfumo, Maputo, Moçambique
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Phone size={18} />
                </span>
                <span className="pt-2">+258 84 000 0000</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Mail size={18} />
                </span>
                <span className="pt-2">geral@procapital.co.mz</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <ContactForm />

            <div className="mt-10 overflow-hidden rounded-2xl border border-line">
              <iframe
                title="Localização da Pro Capital em Maputo"
                src="https://www.google.com/maps?q=Rua+Gil+Vicente+79+Bairro+Coop+Maputo+Mo%C3%A7ambique&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
