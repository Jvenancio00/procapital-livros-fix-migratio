/**
 * Normalização, validação e conversão de códigos ISBN-10 e ISBN-13.
 *
 * Todos os ISBN-10 válidos (prefixo 978) são convertidos canonicamente para
 * ISBN-13 sem separadores, garantindo unicidade na base de dados e prioridade
 * de correspondência na pesquisa e nas importações Excel/CSV.
 */

export function cleanIsbnInput(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw)
    .toUpperCase()
    .replace(/[^0-9X]/g, "");
}

export function parseIsbn(raw: string | null | undefined): {
  clean: string;
  isbn13: string | null;
  valid: boolean;
  isCompleteLength: boolean;
} {
  const clean = cleanIsbnInput(raw);
  const isCompleteLength = clean.length === 10 || clean.length === 13;
  if (!isCompleteLength) {
    return { clean, isbn13: null, valid: false, isCompleteLength: false };
  }
  if (clean.length === 10) {
    const converted = isbn10ToIsbn13(clean);
    return {
      clean,
      isbn13: converted,
      valid: Boolean(converted),
      isCompleteLength: true,
    };
  }
  return {
    clean,
    isbn13: clean,
    valid: isValidIsbn13(clean),
    isCompleteLength: true,
  };
}

export function computeIsbn13CheckDigit(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    const digit = Number(first12[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const mod = (10 - (sum % 10)) % 10;
  return String(mod);
}

export function isValidIsbn10(raw: string): boolean {
  const cleaned = cleanIsbnInput(raw);
  if (!/^\d{9}[\dX]$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += (10 - i) * Number(cleaned[i]);
  }
  sum += cleaned[9] === "X" ? 10 : Number(cleaned[9]);
  return sum % 11 === 0;
}

export function isValidIsbn13(raw: string): boolean {
  const cleaned = cleanIsbnInput(raw);
  if (!/^\d{13}$/.test(cleaned)) return false;
  if (!cleaned.startsWith("978") && !cleaned.startsWith("979")) return false;
  return computeIsbn13CheckDigit(cleaned.slice(0, 12)) === cleaned[12];
}

export function isbn10ToIsbn13(isbn10: string): string | null {
  const cleaned = cleanIsbnInput(isbn10);
  if (!isValidIsbn10(cleaned)) return null;
  const base12 = `978${cleaned.slice(0, 9)}`;
  return `${base12}${computeIsbn13CheckDigit(base12)}`;
}

export type IsbnValidationResult = {
  valid: boolean;
  normalized: string | null;
  kind: "ISBN-13" | "ISBN-10" | "LEGACY" | "EMPTY" | "INVALID";
  warning?: string;
};

/**
 * Valida e normaliza um ISBN.
 * - ISBN-10 válido → convertido para ISBN-13 canónico de 13 dígitos
 * - ISBN-13 com dígito verificador oficial → 13 dígitos limpos
 * - Registo editorial legado de 13 dígitos (ex.: ISBN impresso pela editora com
 *   dígito de controlo atípico) → preservado com aviso explícito na importação
 */
export function validateAndNormalizeIsbn(
  raw: string | null | undefined,
  options?: { strictChecksum?: boolean }
): IsbnValidationResult {
  const cleaned = cleanIsbnInput(raw);
  if (!cleaned) {
    return { valid: true, normalized: null, kind: "EMPTY" };
  }

  if (cleaned.length === 10) {
    const converted = isbn10ToIsbn13(cleaned);
    if (converted) {
      return { valid: true, normalized: converted, kind: "ISBN-10" };
    }
    return {
      valid: false,
      normalized: null,
      kind: "INVALID",
      warning: "ISBN-10 inválido (dígito de controlo incorreto).",
    };
  }

  if (cleaned.length === 13 && /^\d{13}$/.test(cleaned)) {
    if (isValidIsbn13(cleaned)) {
      return { valid: true, normalized: cleaned, kind: "ISBN-13" };
    }
    if (!options?.strictChecksum) {
      return {
        valid: true,
        normalized: cleaned,
        kind: "LEGACY",
        warning: "Código EAN/ISBN de 13 dígitos com dígito verificador não-padrão.",
      };
    }
    return {
      valid: false,
      normalized: null,
      kind: "INVALID",
      warning: "ISBN-13 inválido (dígito de controlo incorreto).",
    };
  }

  return {
    valid: false,
    normalized: null,
    kind: "INVALID",
    warning: "O ISBN deve ter 10 ou 13 dígitos.",
  };
}

export function normalizeIsbnForLookup(raw: string | null | undefined): string | null {
  const res = validateAndNormalizeIsbn(raw, { strictChecksum: false });
  return res.normalized;
}

export function looksLikeFullIsbnQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!/^[\dXx\s-]+$/.test(trimmed)) return false;
  const cleaned = cleanIsbnInput(trimmed);
  return cleaned.length === 10 || cleaned.length === 13;
}

export function formatIsbnDisplay(isbn: string | null | undefined): string | null {
  const cleaned = cleanIsbnInput(isbn);
  if (!cleaned) return null;
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 12)}-${cleaned.slice(12)}`;
  }
  return cleaned;
}
