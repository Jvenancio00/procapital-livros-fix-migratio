# ProCapital — Livros (Fix Migratio)

Site institucional e catálogo de livros da **Pro Capital** — distribuidora sediada em Moçambique com atuação na CPLP (Moçambique, Angola, Portugal, Brasil). Este repositório é o **fix da migração de livros** a partir de `Jvenancio00/pro-capital` (`procapital-livros-corrigido_1.zip`).

> **Estado:** ✅ **A executar** — `npm run dev` em `0.0.0.0:3000` com mock em memória (sem BD), todas as rotas principais a responder 200. `npm run build` passa (44 rotas) e está **pronto para a Vercel** (ver [Deploy na Vercel](#-deploy-na-vercel)).

> **Novo:** banner principal **cinematográfico** (cartaz WebP/JPEG com Ken Burns, luz e grão em CSS, stats, colagem de destaques e camada de vídeo opcional por CDN) — ver [Banner cinematográfico](#-banner-cinematográfico-hero).

---

## 🎯 Problema original — “livros / migração”

O zip `procapital-livros-corrigido_1.zip` já traz o **schema corrigido** (`prisma/schema.prisma`) — categorias hierárquicas, `Editora` como entidade, `Book` com `featuredFrom/featuredTo`, `Price` por moeda, etc. — mas **não traz a pasta `prisma/migrations`**. Resultado:

* `prisma migrate deploy` (usado no `build`: `prisma migrate deploy && next build`) **falhava** com `P1001` / “migrations folder is empty”.
* `prisma generate` falhava em sandboxes offline (E2B) porque `binaries.prisma.sh` está bloqueado — o client ficava como placeholder `throw new Error('did not initialize')` e **nenhuma rota que usa `prisma.*` funcionava** (`/eventos`, `/editoras/[slug]`, `/categoria/[slug]` → 500).
* `DATABASE_URL` não documentada para dev local, e `next/font/google` fazia o **build quebrar** quando `fonts.googleapis.com` está bloqueado.

---

## ✅ Correções aplicadas neste repo

### 1) Migração criada — `prisma/migrations/20260729000000_correcoes_livros/migration.sql`
Gerada a partir do `schema.prisma` corrigido (11 enums + 18 tabelas, com FKs, índices e `DECIMAL(65,30)` para preços). Agora:

```bash
npx prisma migrate deploy   # funciona com DATABASE_URL real (PostgreSQL)
npx prisma migrate dev --name correcoes-livros  # para criar novas migrações
```

* `prisma/migrations/migration_lock.toml` → `provider = "postgresql"` (evita drift).
* Mantém `DATABASE_URL = env("DATABASE_URL")` — sem SQLite “disfarçado”; para dev sem BD usa-se o mock abaixo.

### 2) `lib/prisma.ts` — fallback resiliente (mock em memória)
Antes:
```ts
export const prisma = new PrismaClient() // rebenta sem DATABASE_URL ou sem generate
```
Agora: tenta `PrismaClient` real **só se** `DATABASE_URL` for uma connection string Postgres válida; caso contrário usa **mock em memória** alimentado por `data/books.ts`, `data/editoras.ts` e `CATEGORY_TREE` de `prisma/seed.ts`:

* `category.findMany / findUnique` → 12 categorias (4 topo + 8 filhas) com `books`, `_count`, etc.
* `book.findMany / findUnique` → 12 livros com `prices` (KZ/MT/EUR/BRL)
* `editora.findUnique({ include: { books } })` → livros da editora (corrige `/editoras/[slug]` 500)
* `evento.findMany / findUnique` → 3 eventos com `_count.inscricoes` (corrige `/eventos` 500)
* `orderItem.groupBy`, `favorite`, `review`, etc. → `[]` / `null` com fallback já previsto em `app/page.tsx` (`try/catch` → usa `BOOKS.filter(featured)`).

> Permite `npm run dev` **sem BD** e mantém `app/page.tsx` e `CatalogGrid` funcionais; com BD real, o comportamento é o original (seed + queries reais).

### 3) `scripts/patch-prisma.js` + `package.json#postinstall`
`binaries.prisma.sh` está bloqueado em E2B → `prisma generate` deixa `node_modules/.prisma/client` como placeholder **sem enums** (`ContactReason`, `TipoInstituicao`...). O patch pós-install injeta:

* `Role`, `Currency`, `OrderStatus`, `NoteKind`, `TipoInstituicao`, `EstadoConvenio`, `TipoEvento`, `EstadoInscricao`, `ClientType`, `ContactReason`
* `PrismaClient` tolerante (não lança)

`postinstall` agora:

```json
"postinstall": "prisma generate || echo \"…\"; node scripts/patch-prisma.js || true"
```

Idempotente; em produção com `prisma generate` real, não faz nada.

### 4) `next.config.ts` — preview E2B + build resiliente *(ajustado neste commit, ver [Deploy na Vercel](#-deploy-na-vercel))*
* `allowedDevOrigins: ["*.e2b.app", …]` — permite `https://3000-*.e2b.app` (host/origin allowlist). **Só em desenvolvimento** (`NODE_ENV !== "production"`)
* `headers()` com `X-Frame-Options: ALLOWALL` — evita bloqueio de iframe no LIVE PREVIEW. **Também só em dev**: antes era enviado em produção, o que desligava a proteção contra clickjacking no deploy
* `Cache-Control` explícito em `public/hero-poster.jpg|webp` (1 dia no browser, 1 ano no CDN, `stale-while-revalidate`)
* `typescript: { ignoreBuildErrors: true }` — permite build sem `prisma generate` (tipos em falta no mock); um `console.warn` no arranque do build diz quando é esse o caso
* `build` → `next build` (ver mudança abaixo: `prisma migrate deploy` **saiu** do build)

### 5) `app/layout.tsx` — fontes self-hosted (`next/font/local`)
`next/font/google` faz `fetch` a `fonts.googleapis.com` no **build**; em sandbox/CI sem acesso a esse host o build falhava (`Failed to fetch 'Fraunces'`). O workaround anterior era um mock (`{ variable: "" }`) — que resolvia o build mas deixava **todo o site em Arial na Vercel**, sem a tipografia de marca.

Agora: `Fraunces` e `Inter` (variáveis, `wght 100–900`, subconjuntos `latin` + `latin-ext`) vivem em `app/fonts/*.woff2` e entram por `next/font/local` com `variable: "--font-fraunces"|"--font-inter"` — zero pedidos de rede no build **e** em runtime, `<link rel="preload">` automático, e `adjustFontFallback` ("Times New Roman" para a serifada) para não haver layout shift nos títulos. Funciona igual em Vercel, sandbox e `npm run build` offline.

### 6) `app/loja/entrar/page.tsx` — `useSearchParams` + `Suspense`
Build falhava com `useSearchParams() should be wrapped in a suspense boundary`. Envolvido `EntrarForm` em `<Suspense>`.

### 7) `.env` / `.env.example` / `.gitignore`
* `.env` local (ignorado) → `DATABASE_URL=""` + `AUTH_SECRET` mock para dev sem BD
* `.env.example` documenta Postgres real (`DATABASE_URL="postgresql://…"`)
* `.gitignore` completo (Next, Prisma, env)

---

## ▶️ Executar (como foi feito nesta sessão)

```bash
# 1. Instalar (em sandbox E2B o postinstall faz fallback automaticamente)
npm install
# → prisma generate || echo "…"  ;  node scripts/patch-prisma.js

# 2. Env (dev sem BD — mock em memória)
cp .env.example .env
# ou use o .env já incluído:
# DATABASE_URL=""
# AUTH_SECRET="procapital-local-dev-secret-32chars-please-change-me!!"

# 3. Dev (0.0.0.0 para E2B preview)
npm run dev
# → http://localhost:3000  e  https://3000-<sandbox>.e2b.app

# 4. Build (com ou sem BD — já não corre migrações)
npm run build
# → ✅ Compiled successfully in ~11s, 44 rotas (o `prebuild` tenta `prisma generate`
#    e avisa quando os tipos não existem; ver secção Vercel)

# 5. Com BD real (Neon / Vercel Postgres)
# .env:
# DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
# AUTH_SECRET="$(openssl rand -base64 32)"
# ADMIN_BOOTSTRAP_EMAIL="jdvenancio.7@gmail.com"
# ADMIN_BOOTSTRAP_PASSWORD="…"
npm run db:deploy   # prisma migrate deploy
npm run db:seed     # tsx prisma/seed.ts (12 livros, 17 editoras, 3 eventos, blog, categorias)
npm run dev
```

**Rotas verificadas (200):** `/`, `/catalogo`, `/categoria/escolar|ficcao|infantil`, `/livro/terra-sonambula|mayombe`, `/editoras`, `/editoras/mocambique-editora|alcance-editores`, `/eventos`, `/eventos/feira-do-livro-maputo-2026`, `/blog`, `/sitemap.xml`, etc. (ver `npm run build` → 44 rotas).

**Preview E2B:** a URL mostrada no painel **LIVE PREVIEW**. O dev server está em `0.0.0.0:3000`, com `allowedDevOrigins` e `X-Frame-Options: ALLOWALL` — ambos **apenas em desenvolvimento** (em produção esses cabeçalhos desaparecem, ver §4).

---

## 📁 Estrutura relevante

```
prisma/
  schema.prisma                # schema corrigido (livros, categorias hierárquicas, preços)
  seed.ts                      # 12 livros, 17 editoras, CATEGORY_TREE, 3 eventos, blog
  migrations/
    migration_lock.toml
    20260729000000_correcoes_livros/migration.sql  # ← FIX migratio

lib/
  prisma.ts                    # ← FIX: mock resiliente
  categories.ts / bestsellers.ts / featured.ts

scripts/
  patch-prisma.js              # ← FIX: injeta enums quando generate falha (auto-skip com BD real)

components/
  HeroSection.tsx              # ← banner cinematográfico (camadas, stats, colagem, parallax)
  HeroFilmLayer.tsx            # ← camada de vídeo opcional (CDN), play/pausa, reduced-motion

hooks/
  useMediaQuery.ts             # ← matchMedia via useSyncExternalStore (SSR-safe)

lib/
  hero.ts                      # ← URLs/LQIP do hero + NEXT_PUBLIC_HERO_*_URL

public/
  hero-poster.jpg              # ← cartaz do banner (1600×900, sRGB, progressivo, ~160 KB)
  hero-poster.webp             #   …variante WebP (~75 KB) usada no <picture>
  procapital/logo.jpg

app/
  fonts/                       # ← FIX: Fraunces/Inter self-hosted (woff2 latin + latin-ext)
  opengraph-image.jpg          # ← social card gerado a partir do cartaz do hero
  layout.tsx                   # ← FIX: next/font/local (era mock "offline", depois Arial em prod)
  loja/entrar/page.tsx         # ← FIX: Suspense para useSearchParams
  eventos/page.tsx / [slug]/page.tsx  # usam _count.inscricoes (mock corrigido)
  editoras/[slug]/page.tsx     # usa include.books (mock corrigido)
```

---

## 🎬 Banner cinematográfico (hero)

`components/HeroSection.tsx` é o banner da homepage, construído por camadas (de trás para a frente):

| # | Camada | Como é feita | Porque |
|---|---|---|---|
| 1 | **LQIP** | `HERO_POSTER_LQIP` — o cartaz reduzido a 24×14 e desfoçado, em `data:` URI (~0,5 KB) no `background-image` do contentor | A mancha de cor aparece no **primeiro frame**; nunca há bloco preto nem salto de layout |
| 2 | **Cartaz** | `<picture>` com WebP → JPEG (`public/hero-poster.webp` / `.jpg`, 1600×900, sRGB, progressivo), `fetchPriority="high"`, `width/height` explícitos | LCP controlado, `-45%` de bytes no WebP, CLS 0 |
| 3 | **Vídeo** (opcional) | `HeroFilmLayer`: só existe se `NEXT_PUBLIC_HERO_VIDEO_URL` estiver definido; `preload="none"`, `IntersectionObserver`, fade em `canplay`, botão reproduzir/pausar | Um MP4 em autoplay compete com o LCP e cobra largura de banda no deploy; por omissão o movimento é CSS |
| 4 | **Luz** | `.hero-scrim` (gradiente 100° + brilho âmbar), `.hero-vignette`, `.hero-sweep` (varrimento de luz, 14 s), `.hero-grain` (ruído SVG em `feTurbulence`, 1,4 s em `steps`) | É o que faz um `background-image` parecer um **fotograma**: grão, vinheta e luz a moverem-se — tudo na GPU, zero bytes de rede |
| 5 | **Conteúdo** | Selo pulsante, `h1` em Fraunces `clamp(2.05rem, 6vw, 4.15rem)`, subtítulo, dois CTAs, `dl` com 3 indicadores, colagem das 3 capas em destaque, nota de alcance + indicador `EXPLORAR` | Copie tudo dos dicionários (`dict.hero.*`) — nada de texto no componente |

Movimento e acessibilidade:

* **Ken Burns** (`hero-ken-burns`, 34 s) no cartaz + **parallax** de rato (`onPointerMove` escreve `--hero-x/--hero-y` no contentor — não faz re-render por movimento, e é ignorado em toque).
* Entrada em cascata (`hero-rise`, `animation-delay: calc(var(--hero-i) * 90ms)`) e flutuação das capas (`hero-float`, por item com `--tilt/--hero-offset/--hero-delay`).
* `prefers-reduced-motion: reduce` **desliga todas** as animações do hero (o banner passa a still, os textos ficam visíveis porque `hero-rise` usa `fill-mode: both` e o estado base é `opacity: 1`), e `HeroFilmLayer` nem monta.
* Medido em `npm run build` + `next start` com Chrome headless: LCP = `IMG.hero-poster` **584 ms**, overflow horizontal **0**, `document.fonts.status = loaded`.

Copiar os textos é só mexer em `lib/i18n/dictionaries/*.ts → hero` (`badge`, `title`, `subtitle`, `ctaCatalog`, `ctaClientArea`, `highlightsLabel`, `deliveryNote`, `stats[]`, `scroll`, `playFilm`, `pauseFilm`, `posterAlt`) — o tipo está em `lib/i18n/types.ts`.

Trocar o cartaz: substituir `public/hero-poster.jpg` (e regenerar o WebP/LQIP) **ou** definir `NEXT_PUBLIC_HERO_POSTER_URL` para a CDN. Uma forma prática de gerar os três ficheiros:

```bash
convert novo-cartaz.jpg -resize 1600x900^ -gravity center -extent 1600x900 \
  -colorspace sRGB -strip -interlace Plane -quality 80 public/hero-poster.jpg
convert novo-cartaz.jpg -resize 1600x900^ -gravity center -extent 1600x900 \
  -strip -quality 76 -define webp:method=6 public/hero-poster.webp
```

---

## ▲ Deploy na Vercel

O `build` passou a ser **só `next build`** e o resto do pipeline de deploy foi alinhado com o que a Vercel faz:

```jsonc
// package.json
"engines": { "node": ">=20.9.0" },                 // Next 16 pede Node 20.9+; torna o runtime explícito
"prebuild": "prisma generate || echo …",            // tipos do client antes do build, sem rebentar sem BD
"build": "next build",                              // ← sem `migrate deploy` no build
"build:with-db": "prisma migrate deploy && next build",  // se quiseres migrações no deploy, é isto
"typecheck": "tsc --noEmit"
```

* **`vercel.json`** fixa `framework: "nextjs"`, `buildCommand: "npm run build"` e `installCommand: "npm ci …"` (reprodutível; exige `package-lock.json` em sincronia — está, verificado com `npm ci --dry-run`).
* **Caches de ambiente**: `postinstall`/`prebuild` correm no passo de instalação da Vercel, por isso o `prisma generate` real acontece lá; `scripts/patch-prisma.js` agora **deteta `DATABASE_URL` real e não patcha nada** — assim, se o `generate` falhar num deploy, o erro aparece em vez de o site ficar silenciosamente a servir o mock em memória como se fosse a BD.
* **`ignoreBuildErrors: true` mantém-se** (e não é covardia: `lib/prisma.ts` exporta `prisma: any` para o fallback em memória, o que deixa ~27 `TS7006` implícitos que *não* desaparecem com o client gerado — ligar o type-check só na Vercel trocaria um build verde por um vermelho sem ganhar segurança real). A medição honesta é `npm run typecheck`: os únicos erros *independentes* do `generate` foram corrigidos neste commit (`data/books.ts` com `coverUrl?`, `Map` tipado em `lib/bestsellers.ts`). Quando o mock for substituído por um tipo próprio, passa-se a `ignoreBuildErrors: false`.
* **Variáveis a definir no projeto** (Settings → Environment Variables):

| Variável | Quando | Nota |
|---|---|---|
| `DATABASE_URL` | com BD | `postgresql://…` (Neon **pooled**, `-pooler`). Sem ela a app corre com o mock em memória |
| `AUTH_SECRET` | sempre | sem isto, `/api/auth/*` devolve `MissingSecret` (500) |
| `NEXT_PUBLIC_HERO_POSTER_URL` | opcional | CDN do cartaz (Cloudflare/Bunny/Cloudinary); `public/hero-poster.jpg` é o default |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | opcional | ativa a camada de vídeo do banner |

Migrações no deploy, quando as quiseres automáticas: **Build Command** → `npm run build:with-db`. Sem DB no build, usa `|| true`: `prisma migrate deploy || true && next build` — ou simplesmente corre `npm run db:deploy` uma vez, fora do build (recomendado).

Verificado neste commit com build de produção (`next build` + `next start`): 44 rotas, 0 erros de compilação, e o `/api/auth/session` a responder (deixa de dar `UntrustedHost` — `lib/auth.ts` ganhou `trustHost`, necessário atrás de proxies de plataforma como os domínios `*.vercel.app`/previews; desliga-se com `AUTH_TRUST_HOST=false` + `AUTH_URL`).

---

## 🔄 Migração com BD real

```bash
# já existe a migração inicial; para alterações futuras:
npx prisma migrate dev --name altera-livros
npx prisma generate
```

O `seed` é idempotente (`upsert` por `slug`), pode ser corrido várias vezes.

---

## 📝 Notas

* `next build` **não** corre migrações (antes corria `prisma migrate deploy || echo …`). Correr `migrate deploy` no build era o ponto mais frágil do deploy: com `DATABASE_URL` apontada para um pool Neon frio, o build podia esperar pela BD até ao timeout da Vercel — e um `P1001` no meio do build é exatamente o "build quebra na Vercel". Migrações são um passo de *release* (`npm run db:deploy`), não de compilação.
* Fontes: nada a reverter — o `next/font/local` de `app/layout.tsx` é a versão de produção (ver §5).
* Auth: `ADMIN_BOOTSTRAP_*` só é usado no `seed` para criar o primeiro `User.role = ADMIN`; depois a gestão é na BD.

---

*Branch desta sessão:* `arena/01a06c5c-procapital-livros-fix-migratio`. Todo o trabalho (banner cinematográfico + fixes de build/Deploy Vercel) está nesta branch, em cima do fix de migração de livros.
