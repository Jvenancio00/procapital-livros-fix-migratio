import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, BookMarked } from "lucide-react";
import { prisma } from "@/lib/prisma";
import InscricaoForm from "@/components/InscricaoForm";

const TIPO_LABEL: Record<string, string> = {
  LANCAMENTO: "Lançamento",
  FEIRA: "Feira do livro",
  WORKSHOP: "Workshop",
  OUTRO: "Evento",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const getEvento = cache(async (slug: string) => {
  const evento = await prisma.evento.findUnique({
    where: { slug },
    include: { _count: { select: { inscricoes: { where: { estado: "CONFIRMADA" } } } } },
  });
  return evento;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEvento(slug);
  if (!evento) return { title: "Evento | Pro Capital" };

  return {
    title: `${evento.titulo} | Pro Capital`,
    description: evento.descricao,
  };
}

export default async function EventoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const evento = await getEvento(slug);

  if (!evento) notFound();

  const jaPassou = evento.dataInicio < new Date();
  const vagasRestantes =
    evento.capacidade != null
      ? Math.max(evento.capacidade - evento._count.inscricoes, 0)
      : null;
  const esgotado = vagasRestantes !== null && vagasRestantes <= 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evento.titulo,
    startDate: evento.dataInicio.toISOString(),
    endDate: evento.dataFim?.toISOString(),
    location: {
      "@type": "Place",
      name: evento.local,
      address: evento.endereco ?? evento.local,
    },
    description: evento.descricao,
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <span className="inline-block rounded-full bg-cream-deep px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
        {TIPO_LABEL[evento.tipo] ?? evento.tipo}
      </span>

      <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        {evento.titulo}
      </h1>

      <div className="mt-6 flex flex-col gap-2 text-sm text-foreground/70 sm:flex-row sm:items-center sm:gap-6">
        <span className="flex items-center gap-2">
          <CalendarDays size={16} />
          {formatDate(evento.dataInicio)}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={16} />
          {evento.endereco ? `${evento.local} — ${evento.endereco}` : evento.local}
        </span>
        {evento.editora && (
          <span className="flex items-center gap-2">
            <BookMarked size={16} />
            {evento.editora}
          </span>
        )}
      </div>

      <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground/80">
        {evento.descricao}
      </p>

      <div className="mt-12 rounded-2xl border border-line bg-cream p-6 sm:p-8">
        {jaPassou ? (
          <p className="text-sm text-foreground/60">
            Este evento já terminou. Consulte os próximos eventos na página
            de <a href="/eventos" className="text-brand underline">Eventos</a>.
          </p>
        ) : (
          <>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Inscrever-me neste evento
            </h2>
            {vagasRestantes !== null && (
              <p className="mt-1 text-xs font-medium text-foreground/50">
                {esgotado
                  ? "Vagas confirmadas esgotadas — novas inscrições entram em lista de espera."
                  : `${vagasRestantes} vagas disponíveis`}
              </p>
            )}
            <div className="mt-5">
              <InscricaoForm eventoSlug={evento.slug} esgotado={esgotado} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
