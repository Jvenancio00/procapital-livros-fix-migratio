/**
 * Configuração dos média do banner principal (hero cinematográfico).
 *
 * Porque num módulo separado: o `HeroSection` é um client component e estes
 * valores têm de ser decididos *uma* vez, no mesmo sítio: a camada de vídeo e o
 * `<picture>` do cartaz (WebP + JPEG) têm de apontar sempre para o mesmo URL, e
 * a CDN tem de se poder ligar só com variáveis de ambiente, sem tocar no
 * código.
 *
 * Produção na Vercel: define NEXT_PUBLIC_HERO_*_URL para apontar para uma CDN
 * (Cloudflare Stream/Bunny, Cloudinary, S3+CloudFront). Sem essas variáveis,
 * os ficheiros são servidos de `/public` — ótimo para desenvolvimento, mas
 * em serverless cada MB entregue pela aplicação conta na fatura de largura de
 * banda, e o `hero-poster.jpg` local pesa ~160 KB (vs. ~75 KB do WebP).
 */

function envUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "";
}

/**
 * Cartaz do banner. Em produção com CDN usa-se o URL definido na variável;
 * senão, o ficheiro otimizado em `/public` (1600×900, sRGB, progressivo).
 */
export const HERO_POSTER_SRC =
  envUrl(process.env.NEXT_PUBLIC_HERO_POSTER_URL) || "/hero-poster.jpg";

/**
 * Variante WebP do cartaz, usada no `srcSet` do `<picture>` quando estamos a
 * servir o ficheiro local (≈45% mais leve). Não é derivada de URLs de CDN —
 * ninguém garante que `<url>.webp` existe ao lado do JPEG.
 */
export const HERO_POSTER_WEBP_SRC =
  HERO_POSTER_SRC === "/hero-poster.jpg" ? "/hero-poster.webp" : "";

/** Dimensões intrínsecas do cartaz — evitam layout shift (CLS = 0 no LCP). */
export const HERO_POSTER_DIMENSIONS = { width: 1600, height: 900 } as const;

/**
 * LQIP: o cartaz reduzido a 24×14 e desfoçado, em data URI (~0,5 KB).
 * Vai como `background-image` do contentor do hero, por isso a "mancha" de cor
 * aparece no primeiro frame — o utilizador nunca vê um bloco preto nem um
 * salto de layout enquanto o JPEG/WebP carregam.
 */
export const HERO_POSTER_LQIP =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAOABgDASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAUGBAf/xAAfEAACAgMAAgMAAAAAAAAAAAABAgARAwQFEjEjQWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAGBEAAwEBAAAAAAAAAAAAAAAAAAERAwL/2gAMAwEAAhEDEQA/AOW4ExlDZ+pu52tizFFb0buJVc+rj3iANk+SyApqoOiiomTrhUcjmchNXz2mssaH5CTPV2cmuFXGxCV6hC5z6atF60ScP//Z";

/**
 * Clipe de vídeo ambiente do banner. Deliberadamente **vazio por omissão**:
 * o hero já tem movimento (Ken Burns + varrimento de luz + grão de película,
 * tudo em CSS/GPU) e carregar um MP4 em autoplay custa LCP ao utilizador e
 * largura de banda ao deploy. Basta definir NEXT_PUBLIC_HERO_VIDEO_URL (CDN)
 * para o camada de vídeo aparecer, com controlo de reprodução/pausa e
 * respeitando `prefers-reduced-motion`.
 */
export const HERO_VIDEO_URL = envUrl(process.env.NEXT_PUBLIC_HERO_VIDEO_URL);

/** Há camada de vídeo para mostrar? */
export const HERO_VIDEO_ENABLED = HERO_VIDEO_URL.length > 0;
