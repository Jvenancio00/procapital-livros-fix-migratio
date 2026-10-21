#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const fallbackBin = fs.existsSync("/bin/true")
  ? "/bin/true"
  : fs.existsSync("/usr/bin/true")
    ? "/usr/bin/true"
    : process.execPath;

const env = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable",
  PRISMA_SCHEMA_ENGINE_BINARY:
    process.env.PRISMA_SCHEMA_ENGINE_BINARY || fallbackBin,
  PRISMA_QUERY_ENGINE_LIBRARY:
    process.env.PRISMA_QUERY_ENGINE_LIBRARY || fallbackBin,
};

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 0);
