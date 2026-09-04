import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EventoCard from "@/components/EventoCard";

export const metadata: Metadata = {
  title: "Eventos | Pro Capital",
  description:
    "Lançamentos, feiras do livro e workshops da Pro Capital em Moçambique e na CPLP.",
};

export const revalidate = 60;

export default async function EventosPage() {
  const agora = new Date();

  const [proximos, passados] = await Promise.all([
    prisma.evento.findMany({
      where: { dataInicio: { gte: agora } },
      orderBy: { dataInicio: "asc" },
      include: { _count: { select: { inscricoes: { where: { estado: "CONFIRMADA" } } } } },
    }),
    prisma.evento.findMany({
      where: { dataInicio: { lt: agora } },
      orderBy: { dataInicio: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <span className="inline-block rounded-full bg-cream-deep px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink">
        Eventos
      </span>
      <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        Lançamentos, feiras do livro e workshops
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/70">
        Acompanhe as iniciativas da Pro Capital e das editoras que
        representamos, e inscreva-se diretamente através do site.
      </p>

      <h2 className="mt-14 font-serif text-xl font-semibold text-ink">
        Próximos eventos
      </h2>

      {proximos.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-cream-deep/60 p-10 text-center">
          <CalendarDays size={28} className="mx-auto text-foreground/30" />
          <p className="mt-4 text-foreground/60">
            Ainda não há eventos agendados. Volte em breve.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {proximos.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              vagasRestantes={
                evento.capacidade != null
                  ? Math.max(evento.capacidade - evento._count.inscricoes, 0)
                  : null
              }
            />
          ))}
        </div>
      )}

      {passados.length > 0 && (
        <>
          <h2 className="mt-16 font-serif text-xl font-semibold text-ink">
            Eventos anteriores
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-70">
            {passados.map((evento) => (
              <EventoCard key={evento.id} evento={evento} vagasRestantes={null} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
