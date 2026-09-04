import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export default function ComingSoon({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:py-32">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon size={28} strokeWidth={1.75} />
      </span>
      <span className="mt-6 inline-block rounded-full bg-cream-deep px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
        {eyebrow} · Em breve
      </span>
      <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/70">
        {description}
      </p>
      <Link
        href="/contactos"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark"
      >
        Fale connosco
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
