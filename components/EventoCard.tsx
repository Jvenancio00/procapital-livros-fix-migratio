import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Evento } from "@prisma/client";

const TIPO_LABEL: Record<string, string> = {
  LANCAMENTO: "Lançamento",
  FEIRA: "Feira do livro",
  WORKSHOP: "Workshop",
  OUTRO: "Evento",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function EventoCard({
  evento,
  vagasRestantes,
}: {
  evento: Evento;
  vagasRestantes: number | null;
}) {
  const esgotado = vagasRestantes !== null && vagasRestantes <= 0;

  return (
    <Link
      href={`/eventos/${evento.slug}`}
      className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-brand/30"
    >
      <span className="inline-flex w-fit items-center rounded-full bg-cream-deep px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink">
        {TIPO_LABEL[evento.tipo] ?? evento.tipo}
      </span>
      <h3 className="font-serif text-lg font-semibold leading-snug text-ink">
        {evento.titulo}
      </h3>
      <div className="flex items-center gap-2 text-sm text-foreground/70">
        <CalendarDays size={15} />
        {formatDate(evento.dataInicio)}
      </div>
      <div className="flex items-center gap-2 text-sm text-foreground/70">
        <MapPin size={15} />
        {evento.local}
      </div>
      {vagasRestantes !== null && (
        <span
          className={`mt-1 text-xs font-medium ${
            esgotado ? "text-brand" : "text-foreground/50"
          }`}
        >
          {esgotado ? "Vagas esgotadas — lista de espera" : `${vagasRestantes} vagas disponíveis`}
        </span>
      )}
    </Link>
  );
}
