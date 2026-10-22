import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PRIVATE_PATHS = [
  "/carrinho",
  "/checkout",
  "/favoritos",
  "/obrigado",
  "/cliente/",
  "/admin/",
  "/loja/entrar",
  "/loja/registo",
  "/loja/recuperar-senha",
  "/loja/redefinir-senha",
  "/loja/verificar-email",
  "/loja/conta",
  "/loja/encomendas",
  "/loja/biblioteca",
  "/loja/leitor",
  "/loja/seguranca",
  "/api/",
];

const AI_AND_SEARCH_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      ...AI_AND_SEARCH_AGENTS.map((agent) => ({
        userAgent: agent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
