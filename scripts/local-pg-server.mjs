#!/usr/bin/env node
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.PG_LOCAL_PORT || 54322);
const dataDir = process.env.PG_LOCAL_DATA_DIR || path.join(process.cwd(), ".pgdata");

async function main() {
  const db = await PGlite.create(dataDir);
  await db.exec("SELECT 1;");
  const server = new PGLiteSocketServer({
    db,
    port,
    host: "127.0.0.1",
    maxConnections: 100,
  });
  await server.start();
  console.log(`[local-pg] PostgreSQL ativo em postgresql://postgres:postgres@127.0.0.1:${port}/template1?sslmode=disable`);

  const shutdown = async () => {
    console.log("[local-pg] A encerrar servidor PostgreSQL...");
    await server.stop().catch(() => {});
    await db.close().catch(() => {});
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[local-pg] Falha ao iniciar PostgreSQL:", err);
  process.exit(1);
});
