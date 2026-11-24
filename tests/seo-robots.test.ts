import { test } from "node:test";
import assert from "node:assert/strict";
import robots from "../app/robots";
import { SITE_URL } from "../lib/site";

test("robots isola previews e protege áreas privadas em produção", () => {
  const previous = process.env.VERCEL_ENV;
  try {
    process.env.VERCEL_ENV = "preview";
    assert.deepEqual(robots().rules, { userAgent: "*", disallow: "/" });
    process.env.VERCEL_ENV = "production";
    const result = robots();
    assert.equal(result.sitemap, `${SITE_URL}/sitemap.xml`);
    assert.ok(Array.isArray(result.rules));
    for (const rule of result.rules) {
      assert.ok(Array.isArray(rule.disallow));
      for (const path of ["/admin", "/api", "/cliente", "/carrinho", "/checkout", "/favoritos", "/loja"]) {
        assert.ok(rule.disallow.includes(path));
      }
    }
    assert.ok(result.rules.some(rule => rule.userAgent === "GPTBot"));
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
});
