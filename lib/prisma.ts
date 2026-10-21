import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

export function isDatabaseConfigured(): boolean {
  const url = (process.env.DATABASE_URL ?? "").trim();
  return /^postgres(ql)?:\/\//i.test(url) && !url.includes("utilizador:password@host");
}

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL?.trim() ||
    "postgresql://postgres:postgres@127.0.0.1:54322/template1?sslmode=disable";

  // Instâncias embebidas PGLite-socket operam sobre uma única sessão ativa;
  // max = 1 fila todas as queries concorrentes e transações sem fechar sockets.
  // Em produção (Neon / RDS / PostgreSQL dedicado) usa pool concorrente normal.
  const isEmbeddedLocalSocket = connectionString.includes("127.0.0.1:54322");

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: isEmbeddedLocalSocket ? 1 : 10,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 2_000,
      allowExitOnIdle: true,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
