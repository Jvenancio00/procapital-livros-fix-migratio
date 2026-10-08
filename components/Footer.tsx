"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="border-t border-line bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-serif text-lg font-semibold">
              <span className="text-cream">pro</span>
              <span className="text-orange">capital</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            {dict.footer.tagline}
          </p>
        </div>

        <div>
          <h3 className="font-serif text-base font-semibold">{dict.footer.navigationTitle}</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li>
              <Link href="/catalogo" className="hover:text-cream">{dict.nav.catalog}</Link>
            </li>
            <li>
              <Link href="/editoras" className="hover:text-cream">{dict.nav.publishers}</Link>
            </li>
            <li>
              <Link href="/#solucoes" className="hover:text-cream">{dict.nav.solutions}</Link>
            </li>
            <li>
              <Link href="/#expansao" className="hover:text-cream">{dict.nav.expansion}</Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-cream">{dict.nav.blog}</Link>
            </li>
            <li>
              <Link href="/contactos" className="hover:text-cream">{dict.nav.contacts}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-base font-semibold">{dict.footer.marketsTitle}</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li>Moçambique</li>
            <li>Angola</li>
            <li>Portugal</li>
            <li>Brasil</li>
            <li className="text-cream/50">CPLP</li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-base font-semibold">{dict.footer.contactsTitle}</h3>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>
                Rua Almeida Garrett, Bairro da Coop,
                <br />
                n.º 366, Maputo, Moçambique
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0" />
              <a
                href="tel:+258877046220"
                className="underline-offset-4 hover:text-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                +258 87 704 6220
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0" />
              <a
                href="mailto:comercial@procapitalmz.com"
                className="underline-offset-4 hover:text-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                comercial@procapitalmz.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/50 sm:px-8">
        © {new Date().getFullYear()} Pro Capital, Lda · NUIT 401430857 · {dict.footer.rights}
      </div>
    </footer>
  );
}
