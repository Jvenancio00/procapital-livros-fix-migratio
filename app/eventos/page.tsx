import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EventoCard from "@/components/EventoCard";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Agenda & Eventos | Pro Capital",
  description:
    "Lançamentos editoriais, feiras do livro, sessões escolares e workshops da Pro Capital em Angola, Moçambique, Portugal e Brasil.",
};

export const revalidate = 60;

async function carregarEventos(agora: Date) {
  return Promise.all([
    prisma.evento.findMany({
      where: { dataInicio: { gte: agora } },
      orderBy: { dataInicio: "asc" },
      include: {
        _count: { select: { inscricoes: { where: { estado: "CONFIRMADA" } } } },
      },
    }),
    prisma.evento.findMany({
      where: { dataInicio: { lt: agora } },
      orderBy: { dataInicio: "desc" },
      take: 6,
    }),
  ]);
}

export default async function EventosPage() {
  const agora = new Date();
  let proximos: Awaited<ReturnType<typeof carregarEventos>>[0] = [];
  let passados: Awaited<ReturnType<typeof carregarEventos>>[1] = [];

  try {
    [proximos, passados] = await carregarEventos(agora);
  } catch {
    // Mantém renderização resiliente se a BD estiver temporariamente indisponível
  }

  return (
    <main>
      <PageHeader
        eyebrow="Agenda Cultural & Editorial"
        title="Lançamentos, Feiras do Livro e Sessões Pedagógicas"
        description="Acompanhe as iniciativas da Pro Capital e das editoras parceiras nos mercados de língua portuguesa e confirme a sua presença online."
      />

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
          Próximos Eventos
        </h2>

        {proximos.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-10 text-center">
            <CalendarDays size={28} className="mx-auto text-ink/30" />
            <p className="mt-4 text-sm text-ink/65">
              De momento não existem sessões futuras agendadas. Consulte os
              eventos realizados abaixo ou volte em breve.
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
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
              Edições Anteriores
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-80">
              {passados.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  vagasRestantes={null}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
