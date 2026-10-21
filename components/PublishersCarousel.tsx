import Image from "next/image";
import Link from "next/link";
import type { Editora } from "@/data/editoras";
import EditoraMark from "./EditoraMark";

function PublisherTile({
  editora,
  tabIndex,
}: {
  editora: Editora;
  tabIndex?: number;
}) {
  return (
    <Link
      href={`/editoras/${editora.slug}`}
      aria-label={editora.name}
      tabIndex={tabIndex}
      className="group flex h-24 w-56 shrink-0 items-center justify-center rounded-2xl border border-line/90 bg-white px-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-sm motion-reduce:transform-none"
    >
      {editora.logo ? (
        <Image
          src={editora.logo}
          alt={editora.name}
          width={200}
          height={80}
          sizes="208px"
          className="max-h-13 w-auto object-contain opacity-90 transition-opacity duration-200 group-hover:opacity-100"
        />
      ) : (
        <EditoraMark name={editora.name} country={editora.country} />
      )}
    </Link>
  );
}

export default function PublishersCarousel({
  publishers,
}: {
  publishers: Editora[];
}) {
  const seen = new Set<string>();
  const uniquePublishers = publishers.filter((e) => {
    if (seen.has(e.slug)) return false;
    seen.add(e.slug);
    return true;
  });

  if (uniquePublishers.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-accent" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              Representação &amp; Parcerias Editoriais
            </span>
          </div>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Editoras e chancelas parceiras
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
            Editoras escolares, académicas, infantis e literárias de Moçambique,
            Angola, Portugal e Brasil com distribuição comercial integrada.
          </p>
        </div>

        <Link
          href="/editoras"
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          Ver diretório completo ({uniquePublishers.length}) →
        </Link>
      </div>

      <div
        role="region"
        aria-label="Editoras parceiras"
        className="publishers-marquee-window relative mt-9 overflow-hidden py-1"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-cream to-transparent sm:w-20 motion-reduce:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-cream to-transparent sm:w-20 motion-reduce:hidden"
        />
        <div className="publishers-marquee flex w-max">
          <div className="publishers-marquee__group flex shrink-0 items-center">
            {uniquePublishers.map((editora) => (
              <PublisherTile key={editora.slug} editora={editora} />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="publishers-marquee__group flex shrink-0 items-center"
          >
            {uniquePublishers.map((editora) => (
              <PublisherTile
                key={`dup-${editora.slug}`}
                editora={editora}
                tabIndex={-1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
