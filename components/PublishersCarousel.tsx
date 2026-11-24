import Image from "next/image";
import Link from "next/link";
import type { Editora } from "@/data/editoras";
import EditoraMark from "./EditoraMark";

function PublisherTile({
  editora,
}: {
  editora: Editora;
}) {
  return (
    <Link
      href={`/editoras/${editora.slug}`}
      aria-label={editora.name}
      className="group flex min-h-28 items-center justify-center border-b border-line px-4 py-4 transition-colors hover:border-brand"
    >
      {editora.logo ? (
        <Image
          src={editora.logo}
          alt={editora.representationGroup === "AUTOR" ? `Retrato de ${editora.name}` : `Logótipo da editora ${editora.name}`}
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

      <div role="region" aria-label="Editoras parceiras" className="mt-9 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-4">
        {uniquePublishers.map((editora) => (
          <PublisherTile key={editora.slug} editora={editora} />
        ))}
      </div>
    </section>
  );
}
