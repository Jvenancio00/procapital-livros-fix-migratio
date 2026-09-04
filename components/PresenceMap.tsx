const PRESENCA = [
  { country: "Moçambique", city: "Maputo (sede)", top: 64.4, left: 59.1 },
  { country: "Angola", city: "Luanda", top: 54.9, left: 53.7 },
  { country: "Portugal", city: "Lisboa", top: 28.5, left: 47.5 },
  { country: "Brasil", city: "Brasília", top: 58.8, left: 36.7 },
];

export default function PresenceMap() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <img
        src="/world-map.svg"
        alt="Mapa com a presença da Pro Capital em Moçambique, Angola, Portugal e Brasil"
        className="w-full"
      />
      {PRESENCA.map((p) => (
        <div
          key={p.country}
          className="group absolute -translate-x-1/2 -translate-y-full"
          style={{ top: `${p.top}%`, left: `${p.left}%` }}
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-cream bg-brand" />
          </span>
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-center text-xs font-medium text-cream opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            <span className="block font-semibold">{p.country}</span>
            <span className="block text-[10px] text-cream/70">{p.city}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
