// Marca de uma editora sem logo: um monograma com as iniciais do nome, em vez de
// um ícone genérico. Assim cada editora do carrossel tem a sua identidade visual,
// mesmo enquanto o ficheiro do logo não existe em /public/editoras.
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
  // Um nome de uma só palavra dá duas letras ("Plural" → "PL"), para o monograma
  // não ficar com uma letra só.
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase();
  return source
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export default function EditoraMark({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 font-serif text-sm font-semibold tracking-wide text-brand ${className}`}
    >
      {editoraInitials(name)}
    </span>
  );
}
