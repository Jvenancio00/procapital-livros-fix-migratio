"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="border-t border-line bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
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
              <Link href="/" className="hover:text-cream">{dict.nav.home}</Link>
            </li>
            <li>
              <Link href="/catalogo" className="hover:text-cream">{dict.nav.catalog}</Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-cream">{dict.nav.about}</Link>
            </li>
            <li>
              <Link href="/editoras" className="hover:text-cream">{dict.nav.publishers}</Link>
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
          <h3 className="font-serif text-base font-semibold">{dict.footer.contactsTitle}</h3>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>
                Rua Gil Vicente, n.º 79, R/C, Bairro Coop
                <br />
                Distrito de Kampfumo, Maputo, Moçambique
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0" />
              <span>+258 84 000 0000</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0" />
              <span>geral@procapital.co.mz</span>
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
