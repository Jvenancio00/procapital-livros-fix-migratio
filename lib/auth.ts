import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/totp";

// A gestão de administradores deixou de depender só desta lista fixa no
// código (corrige o mesmo problema estrutural apontado em "Categorias":
// mudar quem é admin não devia exigir deploy). Passa a existir também um
// email de arranque (bootstrap), usado apenas por prisma/seed.ts para
// criar o primeiro admin — depois disso, a fonte de verdade é o campo
// User.role na base de dados, que um admin já autenticado pode alterar.
const LEGACY_ADMIN_EMAILS = ["jdvenancio.7@gmail.com"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  // O host só é conhecido em runtime (Vercel produção/preview com
  // *.vercel.app, proxy de preview em sandbox, reverse proxy self-hosted).
  // Sem isto, a Auth.js v5 rejeita o pedido e `/api/auth/session` devolve 500
  // — a barra de navegação fica sem estado de sessão. `trustHost` é a forma
  // recomendada quando a app corre sempre atrás de um proxy de plataforma; para
  // ambiente fechado (domínio próprio único) define antes AUTH_URL e passa
  // AUTH_TRUST_HOST=false.
  trustHost: process.env.AUTH_TRUST_HOST !== "false",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/loja/entrar",
  },
  providers: [
    Credentials({
      name: "Email e password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpToken: { label: "Código de autenticação", type: "text" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const totpToken = credentials?.totpToken as string | undefined;
        if (!email || !password) return null;

        const ip = request?.headers?.get("x-forwarded-for") ?? undefined;
        const userAgent = request?.headers?.get("user-agent") ?? undefined;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          await prisma.loginEvent.create({
            data: { userId: user.id, ip, userAgent, success: false },
          }).catch(() => {});
          return null;
        }

        // Corrige "Problema 2 – Segurança": quando o 2FA está ativado, a
        // password sozinha já não chega.
        if (user.totpEnabled) {
          if (!totpToken || !user.totpSecret || !verifyTotpToken(user.totpSecret, totpToken)) {
            await prisma.loginEvent.create({
              data: { userId: user.id, ip, userAgent, success: false },
            }).catch(() => {});
            return null;
          }
        }

        await prisma.loginEvent.create({
          data: { userId: user.id, ip, userAgent, success: true },
        }).catch(() => {});

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: LEGACY_ADMIN_EMAILS.includes(user.email) ? "ADMIN" : user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
