// URL canónica do site em produção. Usa NEXT_PUBLIC_SITE_URL se definida
// (útil para pré-visualizações/staging), caso contrário usa o domínio final.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://procapital.co.mz";
