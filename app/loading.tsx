// Estado de carregamento partilhado: as páginas que vão à base de dados
// (catálogo, editoras, eventos) passam a mostrar um esqueleto com a cor da
// marca em vez de um ecrã em branco enquanto o servidor responde.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="h-3 w-24 animate-pulse rounded-full bg-cream-deep" />
      <div className="mt-5 h-8 w-2/3 animate-pulse rounded-lg bg-cream-deep sm:w-1/2" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-full bg-cream-deep" />

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-cream-deep" />
            <div className="mt-3 h-3 w-4/5 animate-pulse rounded-full bg-cream-deep" />
            <div className="mt-2 h-3 w-2/5 animate-pulse rounded-full bg-cream-deep" />
          </div>
        ))}
      </div>

      <span className="sr-only">A carregar conteúdo…</span>
    </div>
  );
}
