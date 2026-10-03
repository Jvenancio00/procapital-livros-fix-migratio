# Pro Capital — Livraria Digital

Site institucional e loja de livros digitais da Pro Capital, construído com Next.js (App Router), Prisma e NextAuth.

## Como correr o projeto localmente

A base de dados é **PostgreSQL** (recomendado: [Neon](https://neon.tech), tem plano gratuito). Precisas de criar uma base de dados lá e copiar a "connection string" para o `.env`.

```bash
# 1. Copia o ficheiro de exemplo e preenche com os teus valores reais
cp .env.example .env

# 2. Instalar dependências
npm install

# 3. Criar as tabelas e semear com dados de exemplo (categorias, livros,
#    editoras, blog, eventos e um utilizador administrador)
npm run db:setup

# 4. Arrancar o servidor de desenvolvimento
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Publicar no Vercel

1. Liga o repositório ao Vercel (Import Project)
2. Em **Settings → Environment Variables**, adiciona `DATABASE_URL` e `AUTH_SECRET` (os mesmos valores do teu `.env`) — sem isto, o build falha, porque `prisma migrate deploy` corre durante o próprio build
3. Faz deploy — o `postinstall` (prisma generate) e o `build` (`prisma migrate deploy && next build`) correm automaticamente
