import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * O cartaz do hero vive em `/public`. Por omissão, `next start` serve
 * ficheiros de `/public` com `max-age=0, must-revalidate` — cada visita volta à
 * origem. Para assets de ~160 KB/75 KB que mudam poucas vezes por ano isso é
 * desperdício puro (e na Vercel conta como bandwidth faturada). Um Cache-Control
 * explícito resolve: o browser guarda 1 dia, o CDN/edge guarda 1 ano e revalida
 * em background.
 */
const MEDIA_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  async headers() {
    const headers = [
      {
        source: "/hero-poster.jpg",
        headers: [{ key: "Cache-Control", value: MEDIA_CACHE_CONTROL }],
      },
      {
        source: "/hero-poster.webp",
        headers: [{ key: "Cache-Control", value: MEDIA_CACHE_CONTROL }],
      },
    ];

    // Só em desenvolvimento: isto é o que permite abrir o preview em sandbox
    // (iframe em `https://<port>-<sandbox>.e2b.app`). Antes era aplicado
    // sempre — em produção desligava a proteção contra clickjacking do site.
    if (!isProduction) {
      headers.push({
        source: "/(.*)",
        headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }],
      });
    }

    return headers;
  },
  images: {
    remotePatterns: [
      // Único host de imagens externas usado via `next/image`
      // (components/AudienceSection.tsx). As capas de Open Library/Google
      // Books em BookCover são `<img>` normais e não passam pelo otimizador.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Validação de origin do dev server para o proxy de preview. Opção tipada em
  // Next 16 (já não precisa de @ts-ignore) e sem efeito em produção, por isso
  // só é definida em desenvolvimento.
  ...(isProduction
    ? {}
    : {
        allowedDevOrigins: [
          "*.e2b.app",
          "*.e2b.dev",
          "*.amazonaws.com",
          "*.cloud.workstations.dev",
        ],
      }),
  poweredByHeader: false,};

export default nextConfig;
