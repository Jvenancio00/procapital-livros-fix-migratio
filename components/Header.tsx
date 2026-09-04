"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, Heart, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/Logo";
import CurrencySelector from "@/components/CurrencySelector";
import LanguageSelector from "@/components/LanguageSelector";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const { slugs } = useWishlist();
  const { data: session } = useSession();
  const { dict } = useLanguage();

  const NAV_LINKS = [
    { href: "/", label: dict.nav.home },
    { href: "/catalogo", label: dict.nav.catalog },
    { href: "/editoras", label: dict.nav.publishers },
    { href: "/sobre", label: dict.nav.about },
    { href: "/blog", label: dict.nav.blog },
    { href: "/contactos", label: dict.nav.contacts },
  ];

  const CATEGORY_LINKS = [
    { href: "/catalogo", label: dict.nav.categories },
    { href: "/convenios", label: dict.nav.agreements },
    { href: "/#destaques", label: dict.nav.highlights },
    { href: "/#mais-vendidos", label: dict.nav.bestsellers },
    { href: "/eventos", label: dict.nav.events },
    { href: "/livro-digital", label: dict.nav.digitalBook },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <CurrencySelector />
            {session?.user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/loja/biblioteca"
                  aria-label={dict.nav.myLibrary}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-brand"
                >
                  <User size={19} />
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-xs font-medium text-foreground/50 hover:text-brand"
                >
                  {dict.nav.logout}
                </button>
              </div>
            ) : (
              <Link
                href="/loja/entrar"
                aria-label={dict.nav.login}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-brand"
              >
                <User size={19} />
              </Link>
            )}
            <Link
              href="/favoritos"
              aria-label={dict.nav.favorites}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-brand"
            >
              <Heart size={19} />
              {slugs.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-semibold text-cream">
                  {slugs.length}
                </span>
              )}
            </Link>
            <Link
              href="/carrinho"
              aria-label={dict.nav.cart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:text-brand"
            >
              <ShoppingCart size={19} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-semibold text-cream">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              href="/cliente/login"
              className="rounded-full border-2 border-brand px-5 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/5"
            >
              {dict.nav.clientArea}
            </Link>
            <Link
              href="/contactos"
              className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-cream transition-colors hover:bg-brand-dark"
            >
              {dict.nav.contactUs}
            </Link>
          </div>
        </nav>

        <button
          type="button"
          aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink sm:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="hidden border-t border-ink/10 bg-ink sm:block">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-2.5 sm:px-8">
          {CATEGORY_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-medium uppercase tracking-wide text-cream/70 transition-colors hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-cream px-5 pb-5 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-cream-deep"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
            {CATEGORY_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wide text-foreground/60 hover:bg-cream-deep"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <LanguageSelector className="flex-1 [&>button]:w-full [&>button]:justify-center" />
              <CurrencySelector className="flex-1 text-center" />
            </div>
            <div className="flex gap-2">
              <Link
                href="/favoritos"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                <Heart size={16} /> {dict.nav.favorites} {slugs.length > 0 && `(${slugs.length})`}
              </Link>
              <Link
                href="/carrinho"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                <ShoppingCart size={16} /> {dict.nav.cart} {totalItems > 0 && `(${totalItems})`}
              </Link>
            </div>
            <Link
              href="/cliente/login"
              className="rounded-full border-2 border-brand px-4 py-3 text-center text-sm font-medium text-brand"
              onClick={() => setOpen(false)}
            >
              {dict.nav.clientArea}
            </Link>
            <Link
              href="/contactos"
              className="rounded-full bg-brand px-4 py-3 text-center text-sm font-medium text-cream"
              onClick={() => setOpen(false)}
            >
              {dict.nav.contactUs}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
