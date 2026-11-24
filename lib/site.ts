// Endereço temporário de produção; NEXT_PUBLIC_SITE_URL permite futura migração.
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://procapital-livros-fix-migration.vercel.app").replace(/\/+$/, "");
