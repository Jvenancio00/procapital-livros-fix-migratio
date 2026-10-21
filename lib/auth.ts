import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { verifyTotpToken } from "@/lib/totp";

const LEGACY_ADMIN_EMAILS = ["jdvenancio.7@gmail.com"];

const RESOLVED_AUTH_SECRET =
  process.env.AUTH_SECRET?.trim() ||
  process.env.NEXTAUTH_SECRET?.trim() ||
  "procapital-institutional-session-fallback-key-2026-cplp";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: RESOLVED_AUTH_SECRET,
  trustHost: true,
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
        if (!isDatabaseConfigured()) return null;

        try {
          const rawEmail = credentials?.email as string | undefined;
          const email = rawEmail?.trim().toLowerCase();
          const password = credentials?.password as string | undefined;
          const totpToken = credentials?.totpToken as string | undefined;
          if (!email || !password) return null;

          const ip = request?.headers?.get("x-forwarded-for") ?? undefined;
          const userAgent = request?.headers?.get("user-agent") ?? undefined;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) {
            await prisma.loginEvent
              .create({
                data: { userId: user.id, ip, userAgent, success: false },
              })
              .catch(() => {});
            return null;
          }

          if (user.totpEnabled) {
            if (
              !totpToken ||
              !user.totpSecret ||
              !verifyTotpToken(user.totpSecret, totpToken)
            ) {
              await prisma.loginEvent
                .create({
                  data: { userId: user.id, ip, userAgent, success: false },
                })
                .catch(() => {});
              return null;
            }
          }

          await prisma.loginEvent
            .create({
              data: { userId: user.id, ip, userAgent, success: true },
            })
            .catch(() => {});

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: LEGACY_ADMIN_EMAILS.includes(user.email)
              ? "ADMIN"
              : user.role,
          };
        } catch {
          return null;
        }
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
