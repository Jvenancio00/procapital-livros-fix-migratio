#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function loadDotEnvIfNeeded() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadDotEnvIfNeeded();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("utilizador:password@host")) {
    console.log("[db:migrate] Sem DATABASE_URL real configurada — a ignorar migrações (modo estático/build sem BD).");
    return;
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      );
    `);

    const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
    const entries = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const dirName of entries) {
      const sqlPath = path.join(migrationsDir, dirName, "migration.sql");
      if (!fs.existsSync(sqlPath)) continue;

      const existing = await client.query(
        `SELECT id FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL`,
        [dirName]
      );
      if (existing.rowCount && existing.rowCount > 0) {
        console.log(`[db:migrate] Já aplicada: ${dirName}`);
        continue;
      }

      const sql = fs.readFileSync(sqlPath, "utf8");
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      const id = crypto.randomUUID();

      console.log(`[db:migrate] A aplicar: ${dirName}...`);
      await client.query(sql);
      await client.query(
        `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
         VALUES ($1, $2, now(), $3, 1)`,
        [id, checksum, dirName]
      );
      console.log(`[db:migrate] Concluída: ${dirName}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[db:migrate] Erro ao aplicar migrações:", err);
  process.exit(1);
});
