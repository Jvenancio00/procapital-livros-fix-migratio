#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  PRISMA_SCHEMA_ENGINE_BINARY: process.env.PRISMA_SCHEMA_ENGINE_BINARY || "/bin/true",
  PRISMA_QUERY_ENGINE_LIBRARY: process.env.PRISMA_QUERY_ENGINE_LIBRARY || "/bin/true",
};

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 0);
