# ProCapital — Livros (Fix Migratio)

Site institucional e catálogo de livros da **Pro Capital** — distribuidora sediada em Moçambique com atuação na CPLP (Moçambique, Angola, Portugal, Brasil). Este repositório é o **fix da migração de livros** a partir de `Jvenancio00/pro-capital` (`procapital-livros-corrigido_1.zip`).

> **Estado:** ✅ **A executar** — `npm run dev` em `0.0.0.0:3000` com mock em memória (sem BD), todas as rotas principais a responder 200. `npm run build` passa, com **`tsc --noEmit` e `eslint` sem qualquer erro ou aviso**.

> **Este README descreve a união de dois ramos:** a *segunda passagem* (tipos próprios em `lib/enums.ts`/`lib/types.ts`, SEO, `loading`/`error`/`not-found`, newsletter a funcionar) e o **banner cinematográfico + hardening do build na Vercel**. Onde os dois divergiram, ficou a solução melhor em cada ponto — está assinalado com ⚔️.

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

### 4) `next.config.ts` — preview E2B + build resiliente
* `allowedDevOrigins: ["*.e2b.app", …]` — permite `https://3000-*.e2b.app` (host/origin allowlist)
* `headers()` com `X-Frame-Options: ALLOWALL` — evita bloqueio de iframe no LIVE PREVIEW
* `typescript: { ignoreBuildErrors: true }` — permite build sem `prisma generate` (tipos em falta no mock)
* `build` → `prisma migrate deploy || echo "…"; next build` (não falha sem BD)

### 5) `app/layout.tsx` — fonts sem rede
`next/font/google` faz `fetch` a `fonts.googleapis.com` no **build**; em sandbox offline o build falhava (`Failed to fetch Fraunces`). Agora usa mock local (`variable: ""`) e comenta o import real — em prod com rede basta descomentar:

```ts
// import { Fraunces, Inter } from "next/font/google";
// const fraunces = Fraunces({ variable: "--font-fraunces", ... });
const fraunces = { variable: "" } as any;
```

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

# 4. Build (com ou sem BD)
npm run build
# → ✅ Compiled successfully in ~11s, 43 páginas (migrate skip se sem BD)

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

**Rotas verificadas (200):** `/`, `/catalogo`, `/categoria/escolar|ficcao|infantil`, `/livro/terra-sonambula|mayombe`, `/editoras`, `/editoras/mocambique-editora|alcance-editores`, `/eventos`, `/eventos/feira-do-livro-maputo-2026`, `/blog`, `/sitemap.xml`, etc. (ver `npm run build` → 43 páginas).

**Preview E2B:** `https://3000-i9jvr7rf0cwuf5ee3wq7s.e2b.app` (ou a porta indicada no painel **LIVE PREVIEW**). O dev server está em `0.0.0.0:3000` com `allowedDevOrigins` e `X-Frame-Options: ALLOWALL`.

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
  patch-prisma.js              # ← FIX: injeta enums quando generate falha

app/
  layout.tsx                   # ← FIX: fonts mock para build offline
  loja/entrar/page.tsx         # ← FIX: Suspense para useSearchParams
  eventos/page.tsx / [slug]/page.tsx  # usam _count.inscricoes (mock corrigido)
  editoras/[slug]/page.tsx     # usa include.books (mock corrigido)
```

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

* `next build` faz `migrate deploy` **antes** do build — em dev sem BD o `|| echo` evita falhar; em prod com BD real a migração corre normalmente.
* Google Fonts: em prod com rede, reverta `app/layout.tsx` para `next/font/google` para ter `Fraunces`/`Inter` com `variable`.
* Auth: `ADMIN_BOOTSTRAP_*` só é usado no `seed` para criar o primeiro `User.role = ADMIN`; depois a gestão é na BD.

---

*Branch desta sessão:* `arena/01a06bb9-procapital-livros-fix-migratio` (a partir de `a0a3a5a`). Todo o trabalho está nesta branch.


---

## 🔧 Segunda passagem — erros de compilação e apresentação pública

### Erros corrigidos

**1. `@prisma/client` deixou de ser fonte de tipos da aplicação**
32 erros de TypeScript vinham de `import { Role, ContactReason, ... } from "@prisma/client"`: esses enums só existem depois de um `prisma generate` bem-sucedido, que falha sem acesso a `binaries.prisma.sh`. Criados:

* `lib/enums.ts` — os 10 enums do `schema.prisma` como objetos `as const` (valores idênticos; o Postgres rejeitaria qualquer divergência na escrita).
* `lib/types.ts` — tipos de leitura das entidades usadas pela UI (`EventoView`, `BookWithPrices`, `CategoryWithBooks`, `LibraryItemView`, `ReviewView`…), satisfeitos tanto pelo Prisma real como pelo mock.

Todos os `implicit any` em callbacks (`.map`, `.filter`, `.reduce`) passaram a ser tipados a partir daqui.

**2. `typescript: { ignoreBuildErrors: true }` removido do `next.config.ts`**
Já não é preciso: o build volta a verificar tipos a sério, por isso um erro real deixa de passar despercebido.

**3. `eslint` passou de 79 erros para 0**

* `components/CatalogGrid.tsx` — a página deixou de ser sincronizada por dois `useEffect` com `setState` (renders em cascata) e passa a ser **derivada** durante a renderização.
* `hooks/useClientAuth.tsx` — mesma correção; `loading`/`session` são agora derivados do estado do NextAuth.
* `context/WishlistContext.tsx` — hidratação do `localStorage` numa única atualização de estado.
* `app/eventos/[slug]/page.tsx` — `<a href="/eventos">` → `<Link>` (perdia a navegação client-side).
* `lib/prisma.ts` — `require()` → `import`; o `no-explicit-any` fica desligado só neste ficheiro (é o adaptador que imita a API genérica do Prisma), com justificação no cabeçalho.

**4. Fontes do site estavam desativadas** ⚔️
`app/layout.tsx` definia `const fraunces = { variable: "" }`, pelo que `--font-fraunces` ficava vazio e **todo o site caía em Times New Roman**.

Duas correções possíveis, e a escolha importa:
* `<link>` à Google Fonts no `<head>` — resolve o build, mas passa o problema para o utilizador: um pedido externo por visita, sujeito a ad-blocker/CSP, com FOUT e o LCP do hero a depender de um terceiro.
* **self-hosting com `next/font/local`** (o que ficou) — `Fraunces` e `Inter` variáveis em `app/fonts/*.woff2`, zero pedidos externos no build *e* em runtime, `<link rel="preload">` gerado pelo Next e `adjustFontFallback: "Times New Roman"` para não haver salto de métricas nos títulos.

`globals.css` mantém a pilha de fallback do sistema em `:root`, por segurança.

### Apresentação ao público

* **Partilha em redes sociais** — `openGraph` + `twitter:card` com imagem, título e descrição. Antes, partilhar o site no WhatsApp ou Facebook mostrava apenas o link cru.
* **Dados estruturados `Organization`** (JSON-LD) com morada, email e países servidos, para o Google mostrar corretamente a ficha da empresa.
* **`title.template`** — as páginas internas herdam o sufixo `| Pro Capital`.
* **Favicon e `theme-color`** a partir do logótipo e da cor institucional.
* **`app/not-found.tsx`** — 404 com a marca e atalhos úteis, em vez do ecrã genérico do Next.
* **`app/error.tsx`** — fronteira de erro com opção de tentar novamente e referência do erro para o suporte.
* **`app/loading.tsx`** — esqueleto de carregamento em vez de ecrã em branco.
* **Newsletter passou a funcionar** — o formulário não tinha `action` nem `onSubmit`, o email era descartado. Agora: modelo `NewsletterSubscriber` + migração `20260907000000_newsletter_subscriber` + `POST /api/newsletter` (validação, idempotente por email) + `components/NewsletterForm.tsx` com estados de envio, erro e confirmação.
* **Hero mais legível** — mais espaço vertical e título maior. O fundo ficou no `<picture>` do ramo do banner (WebP+JPEG com `fetchPriority="high"`), deliberadamente **sem** `next/image`: evita depender do `sharp` em `next start` auto-alojado e dá controlo exato sobre o blur-up/LQIP. Ver a secção do banner.
* **Contactos do rodapé clicáveis** (`tel:` / `mailto:`).
* **Link "Saltar para o conteúdo"** para navegação por teclado e leitores de ecrã.


---

## 🎬 Banner cinematográfico (hero)

`components/HeroSection.tsx`, camada a camada, de trás para a frente:

| # | Camada | Como | Porquê |
|---|---|---|---|
| 1 | LQIP | cartaz reduzido a 24×14 e desfoçado, em `data:` URI (~0,5 KB), no `background-image` do contentor | a mancha de cor existe no **primeiro frame** — sem bloco preto nem salto de layout |
| 2 | Cartaz | `<picture>` WebP → JPEG (`public/hero-poster.webp`/`.jpg`, 1600×900 sRGB progressivo), `width`/`height` explícitos, `fetchPriority="high"` | LCP medido **584 ms** sobre o próprio cartaz; WebP é −47% de bytes |
| 3 | Vídeo | `HeroFilmLayer`, **opcional** por `NEXT_PUBLIC_HERO_VIDEO_URL`: `preload="none"`, fade em `canplay`, pausa fora do viewport, botão ▶/⏸ | um MP4 em autoplay custa LCP ao utilizador e bandwidth ao deploy |
| 4 | Luz | Ken Burns (34 s) + varrimento de luz (14 s) + grão de película (`feTurbulence` em `steps`) + scrim lateral e vinheta | é o que faz um fundo parecer um **fotograma** — 100% GPU, zero bytes de rede |
| 5 | Conteúdo | selo pulsante, `h1` em Fraunces `clamp()`, 3 indicadores (`<dl>`), colagem das capas em destaque, nota de alcance, indicador `EXPLORAR` | copy toda em `dict.hero.*` — nada de texto no componente |

* **`prefers-reduced-motion` desliga tudo** (`useSyncExternalStore`, sem `setState` em effect): o banner continua composto e legível, porque `hero-rise` usa `fill-mode: both` com estado base `opacity: 1`.
* **`min-height` em `svh`** com `vh` de fallback: `vh` em mobile é a viewport *grande*, e o hero ficava mais alto do que o ecrã quando a barra de URL recolhia.
* Colagem em **grid com offsets/tilt por item**, não `position:absolute` — com absolute as capas saíam da coluna e as legendas ficavam por cima da capa vizinha.
* O MP4 antigo do repo (`public/hero-video.mp4`, 2,5 MB) **saiu**: era uma animação gerada a partir do screenshot do mockup (mesmas dimensões exatas, 1918×770), com texto de design dentro do vídeo. Para ligar um filme real: `NEXT_PUBLIC_HERO_VIDEO_URL`.

Texto: `lib/i18n/types.ts → hero` e os 6 dicionários (`badge`, `title`, `subtitle`, `ctaCatalog`, `ctaClientArea`, `highlightsLabel`, `deliveryNote`, `stats[]`, `scroll`, `playFilm`, `pauseFilm`, `posterAlt`).

Trocar o cartaz: substituir `public/hero-poster.jpg` e regenerar WebP/LQIP, **ou** apontar `NEXT_PUBLIC_HERO_POSTER_URL` para a CDN.

```bash
convert novo-cartaz.jpg -resize 1600x900^ -gravity center -extent 1600x900 \
  -colorspace sRGB -strip -interlace Plane -quality 80 public/hero-poster.jpg
convert novo-cartaz.jpg -resize 1600x900^ -gravity center -extent 1600x900 \
  -strip -quality 76 -define webp:method=6 public/hero-poster.webp
```

---

## ▲ Deploy na Vercel

O `build` deixou de ser um passo de *release* disfarçado, e o resto do pipeline foi alinhado com o que a Vercel faz:

```jsonc
// package.json
"engines": { "node": ">=20.9.0" },                 // Next 16 exige 20.9+; torna o runtime explícito
"prebuild": "prisma generate || echo …",           // tipos do client antes do build, sem rebentar sem BD
"build": "next build",                              // ← sem `prisma migrate deploy` no build
"build:with-db": "prisma migrate deploy && next build",  // se quiseres migrações no deploy, é isto
"typecheck": "tsc --noEmit"
```

* **Porque é que `migrate deploy` saiu do build:** com `DATABASE_URL` num pool Neon frio, o build esperava pela BD até ao timeout da Vercel, ou apanhava `P1001` a meio — é exatamente o "build que parte na Vercel". Migrações são passo de release (`npm run db:deploy`).
* **`vercel.json`**: `framework: "nextjs"` (o preset que faltava quando o deploy ficava "Ready" com 404 em todo o site) + `buildCommand`/`installCommand` (`npm ci`, que falha cedo se o `package-lock.json` sair de sincronia — outro clássico).
* **`scripts/patch-prisma.js` não patcha com `DATABASE_URL` real**: se o `generate` falhar num deploy, o erro aparece, em vez de a app servir silenciosamente o mock em memória como se fosse a BD — o cenário de perda de dados mais perigoso deste repo.
* **`X-Frame-Options: ALLOWALL` e `allowedDevOrigins` só em desenvolvimento.** Antes eram enviados sempre, o que desligava a proteção contra clickjacking no site publicado.
* **`Cache-Control` explícito** para `public/hero-poster.jpg|webp`: de `/public`, em produção, o default é `must-revalidate` — cada visita voltava à origem.
* **`lib/auth.ts` com `trustHost`**: atrás de proxy de plataforma (previews `*.vercel.app`), a Auth.js v5 rejeitava o host e `/api/auth/session` devolvia 500 `UntrustedHost`. Desliga-se com `AUTH_TRUST_HOST=false` + `AUTH_URL`.
* **Type-check imposto** (sem `ignoreBuildErrors`): a segunda passagem resolveu a causa real com `lib/enums.ts`/`lib/types.ts` em vez de ignorar os sintomas.

Variáveis a definir no projeto (Settings → Environment Variables):

| Variável | Quando | Nota |
|---|---|---|
| `DATABASE_URL` | com BD | `postgresql://…` (Neon **pooled**, `-pooler`). Sem ela a app corre com o mock em memória |
| `AUTH_SECRET` | sempre | sem isto `/api/auth/*` devolve `MissingSecret` (500) |
| `NEXT_PUBLIC_HERO_POSTER_URL` | opcional | CDN do cartaz; `public/hero-poster.jpg` é o default |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | opcional | liga a camada de vídeo do banner |

Verificado com build de produção (`next build` + `next start`) e Chrome headless a 1440/1920/390 px, com `prefers-reduced-motion` ligado e desligado: LCP 584 ms, overflow horizontal 0, `document.fonts.status = loaded`, Fraunces/Inter a resolverem para as fontes do repo.
