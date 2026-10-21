import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";

const BASE = "http://127.0.0.1:3000";

describe("Pro Capital — E2E HTTP, SSR, PDF, Cotações, Documentos & RBAC (Servidor Live Next.js 16)", () => {
  it("1. Renderiza Homepage SSR com banner oficial, secção escolar e dados reais da BD", async () => {
    const res = await fetch(`${BASE}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("A distribuição editorial que conecta mercados"));
    assert.ok(
      html.includes(
        "Livros, editoras e soluções comerciais para os mercados de língua portuguesa.",
      ),
    );
    assert.ok(html.includes("Explorar catálogo"));
    assert.ok(html.includes("Solicitar parceria"));
  });

  it("2. Responde 200 OK em todas as páginas públicas, escolares, institucionais e conta", async () => {
    const paths = [
      "/livros-escolares",
      "/catalogo",
      "/editoras",
      "/destaques",
      "/mais-vendidos",
      "/cotacoes",
      "/blog",
      "/eventos",
      "/contactos",
      "/sobre",
      "/convenios",
      "/favoritos",
      "/livro-digital",
      "/loja/entrar",
      "/loja/registo",
      "/loja/verificar-email",
    ];
    for (const p of paths) {
      const res = await fetch(`${BASE}${p}`);
      assert.equal(res.status, 200, `Rota ${p} deve responder 200 OK`);
    }
  });

  it("3. API de Pesquisa Avançada (/api/livros/pesquisa) e Mercados (/api/mercados)", async () => {
    const mRes = await fetch(`${BASE}/api/mercados?pais=MZ&perfil=ESCOLA`);
    assert.equal(mRes.status, 200);
    const mJson = await mRes.json();
    assert.equal(mJson.markets.length, 4);

    const sRes = await fetch(
      `${BASE}/api/livros/pesquisa?q=Matem%C3%A1tica&pais=MZ`,
    );
    assert.equal(sRes.status, 200);
    const sJson = await sRes.json();
    assert.ok(Array.isArray(sJson.items));
    assert.ok(sJson.items.length > 0);
  });

  it("4. Exporta Catálogo PDF real via HTTP (/api/catalogo/pdf?pais=AO&categoria=Escolar)", async () => {
    const res = await fetch(`${BASE}/api/catalogo/pdf?pais=AO&categoria=Escolar`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /application\/pdf/);
    const buf = Buffer.from(await res.arrayBuffer());
    assert.equal(buf.subarray(0, 4).toString("ascii"), "%PDF");
    assert.ok(buf.byteLength > 5_000);
  });

  it("5. Regista Pedido de Cotação B2B real via POST /api/cotacoes e protege /admin & /api/admin/*", async () => {
    const qRes = await fetch(`${BASE}/api/cotacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactName: "Direção Pedagógica Teste E2E",
        email: "direcao@escola-teste.co.mz",
        organizationName: "Escola Secundária Teste",
        clientType: "ESCOLA",
        countryCode: "MZ",
        currency: "MT",
        items: [{ title: "Matemática — 8ª Classe", quantity: 35 }],
      }),
    });
    assert.ok(qRes.status === 200 || qRes.status === 201);
    const qJson = await qRes.json();
    const createdQuoteNum = qJson.quoteNumber ?? qJson.quote?.quoteNumber;
    assert.ok(createdQuoteNum);

    await prisma.quoteRequest.deleteMany({
      where: { quoteNumber: createdQuoteNum },
    });

    const adminApiRes = await fetch(`${BASE}/api/admin/livros`);
    assert.equal(adminApiRes.status, 401);

    const adminPageRes = await fetch(`${BASE}/admin`, { redirect: "manual" });
    assert.equal(adminPageRes.status, 307);
    assert.match(adminPageRes.headers.get("location") ?? "", /\/loja\/entrar/);
  });

  it("6. Protege Documento Comercial PDF, Modelo Excel e Relatórios Admin sem sessão (401)", async () => {
    const docRes = await fetch(`${BASE}/api/encomendas/test-id/documento`);
    assert.equal(docRes.status, 401);

    const modelRes = await fetch(`${BASE}/api/admin/importacoes/modelo`);
    assert.equal(modelRes.status, 401);

    const reportRes = await fetch(`${BASE}/api/admin/relatorios?tipo=stock`);
    assert.equal(reportRes.status, 401);

    await prisma.$disconnect();
  });
});
