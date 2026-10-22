import { EDITORAS } from "@/data/editoras";
import { SITE_URL } from "@/lib/site";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Pro Capital — Distribuidora de Livros em Moçambique e na CPLP",
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
  Escolar: "escolar",
  Ficção: "ficcao",
  Infantil: "infantil",
  "Não-ficção": "nao-ficcao",
};

export function slugifyText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategorySlugForName(categoryName: string): string {
  return CATEGORY_SLUG_MAP[categoryName] ?? slugifyText(categoryName);
}

export function getEditoraSlugForName(editoraName: string): string {
  const matched = EDITORAS.find(
    (item) => item.name.toLowerCase() === editoraName.toLowerCase(),
  );
  return matched?.slug ?? slugifyText(editoraName);
}

export function buildBreadcrumbJsonLd(
  items: BreadcrumbEntry[],
  currentPath?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, idx) => {
      const targetUrl = entry.href
        ? `${SITE_URL}${entry.href}`
        : currentPath
        ? `${SITE_URL}${currentPath}`
        : undefined;

      return {
        "@type": "ListItem",
        position: idx + 1,
        name: entry.label,
        ...(targetUrl ? { item: targetUrl } : {}),
      };
    }),
  };
}

export function buildGlobalOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "BookStore"],
        "@id": `${SITE_URL}/#organization`,
        name: "Pro Capital",
        alternateName: "Pro Capital — Distribuidora Editorial",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/procapital/logo.jpg`,
        },
        image: `${SITE_URL}/og-image.jpg`,
        description:
          "Distribuidora editorial de livros escolares, académicos, infantis e literários com sede em Maputo e operação comercial em Moçambique, Angola, Portugal e Brasil.",
        telephone: "+258 87 704 6220",
        email: "comercial@procapitalmz.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rua Almeida Garrett, Bairro da Coop, n.º 366",
          addressLocality: "Maputo",
          addressRegion: "Maputo Cidade",
          addressCountry: "MZ",
        },
        areaServed: [
          { "@type": "Country", name: "Moçambique" },
          { "@type": "Country", name: "Angola" },
          { "@type": "Country", name: "Portugal" },
          { "@type": "Country", name: "Brasil" },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: "+258 87 704 6220",
            email: "comercial@procapitalmz.com",
            availableLanguage: ["Portuguese", "English", "Spanish", "French"],
            areaServed: ["MZ", "AO", "PT", "BR"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Pro Capital",
        inLanguage: "pt-MZ",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/catalogo?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
