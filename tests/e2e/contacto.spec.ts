import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { Pool } from "pg";

test("contacto é guardado, cria EmailLog e redireciona para obrigado", async ({ page, baseURL }) => {
  test.skip(process.env.E2E_LOCAL_WRITE !== "1", "Ativar apenas com servidor e BD locais descartáveis; ver README.");
  const site = new URL(baseURL || "http://127.0.0.1:3000");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL local obrigatória");
  const db = new URL(connectionString);
  if (!["localhost", "127.0.0.1"].includes(site.hostname) || !["localhost", "127.0.0.1"].includes(db.hostname)) {
    throw new Error("Teste de escrita só permitido com site e BD locais.");
  }
  const email = `teste+${randomUUID()}@example.invalid`;
  const pool = new Pool({ connectionString });
  try {
    await page.goto("/contactos");
    await page.locator('[name="nome"]').fill("Teste automatizado");
    await page.locator('[name="email"]').fill(email);
    await page.locator('[name="mensagem"]').fill("Mensagem de teste local descartável.");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page).toHaveURL(/\/obrigado\?origem=contacto/);
    const contact = await pool.query('SELECT id FROM "ContactRequest" WHERE email = $1', [email]);
    expect(contact.rowCount).toBe(1);
    const logs = await pool.query('SELECT status FROM "EmailLog" WHERE "metaJson"->>\'email\' = $1 AND template = $2', [email, "COMMERCIAL_CONTACT"]);
    expect(logs.rowCount).toBe(1);
    expect(logs.rows[0].status).toBe("UNCONFIGURED");
  } finally {
    await pool.query('DELETE FROM "EmailLog" WHERE "metaJson"->>\'email\' = $1 AND template = $2', [email, "COMMERCIAL_CONTACT"]);
    await pool.query('DELETE FROM "ContactRequest" WHERE email = $1', [email]);
    await pool.end();
  }
});
