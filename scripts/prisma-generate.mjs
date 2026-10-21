#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const fallbackBin = fs.existsSync("/bin/true")
  ? "/bin/true"
  : fs.existsSync("/usr/bin/true")
    ? "/usr/bin/true"
    : process.execPath;

const localPrismaBin = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);

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

const cmd = fs.existsSync(localPrismaBin) ? localPrismaBin : "npx";
const args = fs.existsSync(localPrismaBin)
  ? ["generate"]
  : ["prisma@6.19.3", "generate"];

const result = spawnSync(cmd, args, {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 0);
