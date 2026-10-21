"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  FileDown,
  FileSpreadsheet,
  Heart,
  Menu,
  ShieldCheck,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Logo from "./Logo";
import CurrencySelector from "./CurrencySelector";
import MarketSelector from "./MarketSelector";
import LanguageSelector from "./LanguageSelector";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { slugs } = useWishlist();
  const { market } = useCurrency();
  const { dict } = useLanguage();
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "ADMIN";
  const accountHref = session ? "/loja/conta" : "/loja/entrar";
  const accountLabel = session ? dict.nav.myLibrary : dict.nav.login;

  const navLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/livros-escolares", label: "Livros Escolares" },
    { href: "/catalogo", label: dict.nav.catalog },
    { href: "/editoras", label: dict.nav.publishers },
    { href: "/cotacoes", label: "Cotações B2B" },
    { href: "/blog", label: dict.nav.blog },
    { href: "/sobre", label: dict.nav.about },
    { href: "/contactos", label: dict.nav.contacts },
  ];

  const utilityLinks = [
    { href: "/convenios", label: dict.nav.agreements },
    { href: "/eventos", label: dict.nav.events },
    {
      href: `/api/catalogo/pdf?pais=${market}`,
      label: "Catálogo PDF",
      external: true,
    },
    { href: "/cliente/catalogo", label: dict.nav.clientArea },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-cream/95 backdrop-blur-md">
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 text-xs sm:px-8">
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
            <MarketSelector variant="dark" />
            <nav
              aria-label="Acesso rápido institucional"
              className="hidden items-center gap-4 text-white/75 xl:flex"
            >
              {utilityLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-accent"
                  >
                    <FileDown size={12} aria-hidden="true" />
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              href="/livro-digital"
              aria-current={isActive("/livro-digital") ? "page" : undefined}
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-colors md:inline-flex ${
                isActive("/livro-digital")
                  ? "border-accent bg-accent text-ink"
                  : "border-accent/40 bg-accent/15 text-amber-200 hover:bg-accent/25"
              }`}
            >
              <BookOpen size={12} aria-hidden="true" />
              <span>{dict.nav.digitalBook}</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <ShieldCheck size={12} aria-hidden="true" />
                <span>Admin</span>
              </Link>
            )}

            <div className="hidden items-center gap-2 sm:flex">
              <LanguageSelector />
              <CurrencySelector />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-5 lg:flex xl:gap-6"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  active
                    ? "font-semibold text-brand after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-brand"
                    : "text-ink/80 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/favoritos"
            aria-label={`${dict.nav.favorites} (${slugs.length})`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line/80 bg-white text-ink transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Heart size={17} />
            {slugs.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {slugs.length}
              </span>
            )}
          </Link>

          <Link
            href="/carrinho"
            aria-label={`${dict.nav.cart} (${totalItems})`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line/80 bg-white text-ink transition-colors hover:border-brand/40 hover:text-brand"
          >
            <ShoppingCart size={17} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <Link
            href={accountHref}
            aria-label={accountLabel}
            className="hidden h-10 items-center gap-2 rounded-full border border-line/90 bg-white px-3.5 text-xs font-semibold text-ink transition-colors hover:border-ink/35 md:inline-flex"
          >
            <User size={15} />
            <span>{session ? "Conta" : "Entrar"}</span>
          </Link>

          <Link
            href="/cotacoes"
            className="hidden h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-dark sm:inline-flex"
          >
            <FileSpreadsheet size={14} aria-hidden="true" />
            <span>Pedir Cotação</span>
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line/90 bg-white text-ink lg:hidden"
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-white px-5 py-6 shadow-lg lg:hidden">
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3.5 py-2.5 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-cream-deep font-semibold text-brand"
                    : "text-ink/85 hover:bg-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
            <Link
              href="/livro-digital"
              onClick={() => setMenuOpen(false)}
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand/30 bg-brand/5 px-3 py-2.5 text-xs font-semibold text-brand"
            >
              <BookOpen size={14} aria-hidden="true" />
              <span>{dict.nav.digitalBook}</span>
            </Link>
            {utilityLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-ink/80"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-ink/80"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 sm:hidden">
            <LanguageSelector />
            <CurrencySelector />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-line pt-4">
            <Link
              href={accountHref}
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink"
            >
              <User size={15} />
              {session ? "Minha Conta" : dict.nav.login}
            </Link>
            <Link
              href="/cotacoes"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FileSpreadsheet size={15} />
              Pedir Cotação
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
