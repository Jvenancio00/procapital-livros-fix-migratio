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
  });

  it("7. Secção Livro Digital (/livro-digital) e redirecionamento permanente de /livro/livro-gratuito sem 404", async () => {
    const stripScripts = (s: string) =>
      s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

    const legacyRedirect = await fetch(`${BASE}/livro/livro-gratuito`, {
      redirect: "manual",
    });
    assert.ok(
      legacyRedirect.status === 308 || legacyRedirect.status === 307,
      `Esperado redirecionamento 307/308 para /livro/livro-gratuito, recebido ${legacyRedirect.status}`,
    );
    assert.equal(legacyRedirect.headers.get("location"), "/livro-digital");

    const followed = await fetch(`${BASE}/livro/livro-gratuito`);
    assert.equal(followed.status, 200);
    const visibleHtml = stripScripts(await followed.text());
    assert.ok(visibleHtml.includes("Secção Livro Digital"));
    assert.ok(visibleHtml.includes("Leitor Digital Integrado Pro Capital"));
    assert.ok(!visibleHtml.includes("Não encontrámos esta página"));
    assert.ok(!visibleHtml.includes("ERRO 404"));
  });

  it("8. Crawler completo de links internos (<a href>) garante ZERO erros 404 ou 500 em todo o site", async () => {
    const stripScripts = (s: string) =>
      s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

    const seedPages = [
      "/",
      "/livro-digital",
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
      "/carrinho",
      "/loja/entrar",
      "/loja/registo",
    ];

    const discovered = new Set<string>(seedPages);
    const hrefRegex = /href="(\/[^"#]*)"/g;

    for (const page of seedPages) {
      const res = await fetch(`${BASE}${page}`);
      assert.equal(res.status, 200, `Página base ${page} falhou com ${res.status}`);
      const html = await res.text();
      const visible = stripScripts(html);
      assert.ok(
        !html.includes("/livro/livro-gratuito"),
        `Página ${page} ainda contém referência quebrada a /livro/livro-gratuito`,
      );
      assert.ok(
        !visible.includes("Não encontrámos esta página"),
        `Página ${page} renderizou ecrã 404`,
      );
      assert.ok(
        !visible.includes("Algo correu mal deste lado"),
        `Página ${page} renderizou ecrã 500`,
      );

      let match: RegExpExecArray | null;
      while ((match = hrefRegex.exec(html)) !== null) {
        const cleanHref = match[1].replace(/&amp;/g, "&");
        if (!cleanHref.startsWith("/_next/")) {
          discovered.add(cleanHref);
        }
      }
    }

    assert.ok(
      discovered.size >= 50,
      `Crawler devia descobrir pelo menos 50 rotas internas reais, encontrou ${discovered.size}`,
    );

    for (const href of discovered) {
      const res = await fetch(`${BASE}${href}`);
      assert.equal(
        res.status,
        200,
        `Link interno ${href} devolveu HTTP ${res.status} em vez de 200 OK`,
      );
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/html")) {
        const visible = stripScripts(await res.text());
        assert.ok(
          !visible.includes("Não encontrámos esta página"),
          `Link interno ${href} renderizou página de Erro 404`,
        );
        assert.ok(
          !visible.includes("Algo correu mal deste lado"),
          `Link interno ${href} renderizou página de Erro 500`,
        );
      }
    }

    await prisma.$disconnect();
  });
});
