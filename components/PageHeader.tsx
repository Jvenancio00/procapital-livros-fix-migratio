import Link from "next/link";
import type { ReactNode } from "react";
import { buildBreadcrumbJsonLd, type BreadcrumbEntry } from "@/lib/seo";

export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbEntry[];
  actions?: ReactNode;
}) {
  const breadcrumbJsonLd =
    breadcrumbs && breadcrumbs.length > 0
      ? buildBreadcrumbJsonLd(breadcrumbs)
      : null;

  return (
    <header className="mx-auto max-w-7xl px-5 pt-10 pb-8 sm:px-8 sm:pt-12 sm:pb-10">
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Navegação estrutural"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink/55"
        >
          {breadcrumbs.map((item, idx) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              {idx > 0 && <span aria-hidden="true">/</span>}
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-brand">
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink/85" aria-current="page">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-6 border-b border-line/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              {eyebrow}
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/70">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
