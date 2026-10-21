const STOP_WORDS = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "editora",
  "editores",
  "editorial",
  "distribuidora",
  "livros",
  "ltda",
]);

export function editoraInitials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word.toLowerCase()));
  const source = words.length > 0 ? words : name.split(/\s+/);
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase();
  return source
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

/**
 * Apresentação tipográfica editorial para editoras sem ficheiro de logótipo:
 * exibe sempre o nome real da editora com hierarquia de chancela editorial e
 * filete dourado discreto, sem substituir o nome por círculos de iniciais.
 */
export default function EditoraMark({
  name,
  country,
  className = "",
}: {
  name: string;
  country?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-2 text-center ${className}`}
    >
      <span className="mb-1.5 h-0.5 w-6 bg-accent/85" aria-hidden="true" />
      <span className="line-clamp-2 font-serif text-sm font-semibold leading-snug tracking-tight text-ink">
        {name}
      </span>
      {country && (
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/45">
          {country}
        </span>
      )}
    </div>
  );
}
