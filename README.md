# Pro Capital — Livraria Digital

Site institucional e loja de livros da Pro Capital, com Next.js, Prisma e NextAuth.

## Desenvolvimento e testes locais

1. Instale as dependências com `npm ci` e copie `.env.example` para `.env`.
2. Para uma base local isolada, execute `npm run db:local` num terminal; noutro, configure `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/template1?sslmode=disable` no `.env` e execute `npm run db:setup`. Esse comando aplica migrações e dados iniciais: não o use numa base de produção sem avaliação prévia. Para os testes de integração, o seed precisa de `ADMIN_BOOTSTRAP_EMAIL=admin@procapitalmz.com` e de uma password local forte em `ADMIN_BOOTSTRAP_PASSWORD`.
3. Inicie `npm run dev` (ou `npm run build` seguido de `npm start`) na porta 3000. Com a base e o servidor ativos, execute `npm test`. Os testes HTTP usam `http://127.0.0.1:3000` e modificam dados: use apenas uma base descartável. Alguns testes de SEO esperam ambiente de produção; para executá-los, faça o build e inicie o servidor com `VERCEL_ENV=production` num ambiente local isolado.
4. Execute `npx tsc --noEmit` e `npm run lint`. O lint mantém avisos sobre efeitos legados em vez de alterar fluxos de loja e administração.

## Colocar em produção

1. Na Vercel, em **Settings → Environment Variables**, configure no ambiente Production: `DATABASE_URL`, `AUTH_SECRET` (gerar com `npx auth secret`), `NEXT_PUBLIC_SITE_URL=https://procapital-livros-fix-migration.vercel.app`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, `EMAIL_FROM`, `ADMIN_ALERT_EMAIL` e um fornecedor: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` ou `RESEND_API_KEY`. Não coloque segredos no Git. O bootstrap cria o administrador no seed, não por simples atribuição de variáveis; avalie e execute o seed de forma controlada.
2. Conforme os serviços efetivamente usados, configure `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` e, opcionalmente, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENT_WEBHOOK_HMAC_SECRET`, `MPESA_API_KEY`, `NEXT_PUBLIC_HERO_VIDEO_URL` e `NEXT_PUBLIC_HERO_POSTER_URL`. O build pode continuar quando a BD está inacessível; verifique as migrações e o funcionamento real da base antes de publicar.
3. Em **Settings → Domains**, adicione `procapitalmz.com` e `www.procapitalmz.com`, use os registos DNS exatos apresentados pela Vercel, aguarde validação e HTTPS. Configure `www` como redirecionamento permanente para `procapitalmz.com`. Verifique o domínio de produção `*.vercel.app`: se a Vercel não permitir redirecioná-lo separadamente sem afetar previews, configure um redirecionamento específico para esse host de produção; não redirecione todos os previews. Os previews devem devolver `Disallow: /` no robots. Outros domínios só devem ser adicionados e redirecionados se forem seus.
4. Crie a propriedade GA4 e coloque o ID G-… na variável correspondente. No Google Search Console, adicione o prefixo `https://procapitalmz.com/` (ou propriedade de domínio via DNS), copie o código de verificação, faça novo deploy e verifique. Submeta `https://procapitalmz.com/sitemap.xml`; peça indexação da home, `/catalogo`, `/editoras`, `/contactos` e três livros reais.
5. No Bing Webmaster Tools, importe a propriedade do Search Console ou use o código `msvalidate.01`, faça redeploy e verifique; submeta o mesmo sitemap.
6. Crie/reclame o Google Business Profile, confirmando nome, morada e telefone reais e consistentes com o site. Forneça capas, logos e outros conteúdos reais antes de os integrar.

### Checklist de validação após o deploy

- [ ] `robots.txt` e `sitemap.xml` respondem 200; sitemap apenas com o domínio canónico; previews bloqueados e domínio alternativo redirecionado.
- [ ] Página inexistente devolve 404; páginas privadas e `/obrigado` têm noindex; `/admin` pode redirecionar utilizadores sem sessão.
- [ ] Títulos, descriptions e canonical próprios para home, catálogo, livro e editora; imagens de partilha respondem.
- [ ] Validar Organization/BookStore, BreadcrumbList, FAQPage e Book no Rich Results Test e em validator.schema.org.
- [ ] Testar contacto com email real e redirecionamento; confirmar visita no GA4 em tempo real.
- [ ] Confirmar propriedade e estado do sitemap no Search Console e no Bing; testar pedidos de indexação.
- [ ] Executar Lighthouse mobile e registar resultados reais de Performance, SEO e Acessibilidade; investigar valores abaixo de 90.
- [ ] Consultar `site:procapitalmz.com` mais tarde: rastreio e indexação não são garantidos nem imediatos; podem demorar dias ou semanas.

### Testes de navegador (Playwright)

Instale Chromium com `npx playwright install chromium` e inicie o site num servidor separado. `BASE_URL=http://127.0.0.1:3000 npm run test:e2e` corre testes de leitura; também aceita uma URL de preview. Os testes atuais são uma cobertura **parcial**, não uma validação de todos os fluxos críticos.

O teste de contacto é ignorado por defeito e só pode correr com site e `DATABASE_URL` locais. Use uma BD descartável, inicie o servidor local com `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` e `RESEND_API_KEY` vazios para impedir emails reais, e depois execute `E2E_LOCAL_WRITE=1 DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/template1?sslmode=disable npm run test:e2e`. O teste cria um endereço `example.invalid` único e elimina os registos criados. Não o execute apontado para produção ou com fornecedor de email ativo.

### URL de produção temporário

O endereço público temporário é `https://procapital-livros-fix-migration.vercel.app`. O projeto usa-o por defeito para URLs canónicos, sitemap e metadados. Na Vercel, confirme que `NEXT_PUBLIC_SITE_URL` no ambiente Production está definido para esse endereço (uma variável existente tem prioridade sobre o valor por defeito) e faça um novo deployment. Previews continuam a ser bloqueados no robots. O endereço de email comercial não foi alterado; a sua entrega deve ser confirmada separadamente.

Para um futuro domínio próprio, adicione e valide o domínio no projeto Vercel, siga os valores DNS apresentados pela Vercel, confirme HTTPS e redirecionamento da variante secundária; só depois atualize `NEXT_PUBLIC_SITE_URL` em Production, publique novamente e verifique canonical, robots e sitemap. Não elimine registos de email sem os rever.
