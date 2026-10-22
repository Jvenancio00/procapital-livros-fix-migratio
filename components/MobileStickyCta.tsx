"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileSpreadsheet, MessageSquare, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const HIDDEN_PREFIXES = [
  "/carrinho",
  "/checkout",
  "/contactos",
  "/cotacoes",
  "/obrigado",
  "/admin",
  "/loja/leitor",
  "/loja/entrar",
  "/loja/registo",
];

export default function MobileStickyCta() {
  const pathname = usePathname() || "/";
  const { totalItems } = useCart();

  const shouldHide = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (shouldHide) {
    return null;
  }

  const isCatalogOrBookPage =
    pathname.startsWith("/livro/") ||
    pathname === "/catalogo" ||
    pathname === "/livros-escolares" ||
    pathname.startsWith("/categoria/") ||
    pathname === "/destaques" ||
    pathname === "/mais-vendidos";

  const primaryHref =
    totalItems > 0
      ? "/carrinho"
      : isCatalogOrBookPage
      ? "/cotacoes"
      : "/catalogo";

  const primaryLabel =
    totalItems > 0
      ? `Encomendar (${totalItems})`
      : isCatalogOrBookPage
      ? "Pedir Cotação"
      : "Explorar Catálogo";

  const PrimaryIcon =
    totalItems > 0
      ? ShoppingCart
      : isCatalogOrBookPage
      ? FileSpreadsheet
      : BookOpen;

  return (
    <aside
      aria-label="Ações rápidas móveis"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2.5">
        <Link
          href={primaryHref}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-dark"
        >
          <PrimaryIcon size={15} aria-hidden="true" />
          <span>{primaryLabel}</span>
        </Link>

        <Link
          href="/contactos"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:text-brand"
        >
          <MessageSquare size={15} aria-hidden="true" />
          <span>Falar connosco</span>
        </Link>
      </div>
    </aside>
  );
}
