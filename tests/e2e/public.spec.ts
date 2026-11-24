import { expect, test } from "@playwright/test";

const pages = [
  ["início", "/"], ["catálogo", "/catalogo"],
  ["categoria", "/categoria/escolar"], ["editora", "/editoras/alcance-editores"],
  ["livro", "/livro/matematica-8a-classe"], ["blog", "/blog"],
  ["eventos", "/eventos"], ["sobre", "/sobre"],
  ["contactos", "/contactos"], ["privacidade", "/privacidade"],
] as const;

for (const [name, path] of pages) {
  test(`página pública ${name} responde e não produz erros na consola`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/\S/);
    await expect(page.locator("main")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("as páginas públicas têm títulos distintos", async ({ page }) => {
  const titles: string[] = [];
  for (const [, path] of pages) {
    await page.goto(path);
    titles.push(await page.title());
  }
  expect(new Set(titles).size).toBe(titles.length);
});

test("pesquisa avançada encontra um título do catálogo", async ({ page }) => {
  await page.goto("/catalogo");
  const search = page.getByRole("search", { name: "Pesquisa avançada de livros" });
  await search.getByPlaceholder(/ISBN, título/).fill("Matemática");
  await search.getByRole("button", { name: "Pesquisar" }).click();
  await expect(page).toHaveURL(/q=Matem/);
  await expect(page.getByText("Matemática — 8ª Classe").first()).toBeVisible();
});

test("página inexistente responde 404 com página personalizada", async ({ page }) => {
  const response = await page.goto("/teste-rota-inexistente-404");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /Não encontrámos esta página/ })).toBeVisible();
});
