import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthProvider from "@/components/AuthProvider";
import { SITE_URL } from "@/lib/site";

// Fontes: self-hosted via `next/font/local`, com os .woff2 em `app/fonts`.
//
// Duas abordagens já tentadas e ambas rejeitadas, e por motivos diferentes:
//  - `next/font/google` faz fetch a fonts.googleapis.com *durante o build* →
//    rebenta em CI/sandbox sem acesso a esse host ("Failed to fetch `Fraunces`").
//  - carregar a folha de estilos da Google com um <link> no <head> resolve o
//    build, mas passa o problema para o utilizador: um pedido externo por
//    visita, bloqueado por ad-blocker/CSP, com FOUT e LCP a depender de um
//    terceiro. E o mock antigo (`{ variable: "" }`) deixava o site em Arial.
//
// O self-hosting não tem nenhum dos dois problemas: zero pedidos externos no
// build *e* em runtime, `<link rel="preload">` gerado pelo Next, e `size-adjust`
// para não haver layout shift quando o webfont entra. Subconjuntos latin +
// latin-ext (cobre acentos de PT/EN/ES/FR), pesos variáveis 100–900.
const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "Times New Roman"],
  // O `size-adjust` do Next é calculado contra uma métrica de referência: para
  // uma serifada de texto, "Times New Roman" aproxima-se muito mais do Georgia
  // (o fallback real) do que o Arial por omissão — evita o salto de tamanho nos
  // títulos do hero quando o webfont entra.
  adjustFontFallback: "Times New Roman",
  src: [
    { path: "./fonts/fraunces-latin-wght.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-latin-ext-wght.woff2", weight: "100 900", style: "normal" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "Arial"],
  src: [
    { path: "./fonts/inter-latin-wght.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/inter-latin-ext-wght.woff2", weight: "100 900", style: "normal" },
  ],
});

const SITE_DESCRIPTION =
  "Pro Capital é uma distribuidora de livros sediada em Moçambique, com atuação em Moçambique, Angola, Portugal, Brasil e demais países da CPLP, ao serviço de livrarias, escolas e do público em geral.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pro Capital | Distribuidora de Livros",
    // As páginas internas definem só o seu nome; o sufixo é acrescentado
    // automaticamente, para o separador do browser e os resultados de
    // pesquisa ficarem consistentes em todo o site.
    template: "%s | Pro Capital",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Pro Capital",
  keywords: [
    "distribuidora de livros",
    "livros Moçambique",
    "manuais escolares",
    "livros CPLP",
    "editoras lusófonas",
    "livraria Maputo",
  ],
  authors: [{ name: "Pro Capital, Lda" }],
  alternates: { canonical: SITE_URL },
  // Sem estas etiquetas, uma partilha no WhatsApp ou no Facebook mostrava
  // apenas o link cru — o que é péssimo para um site virado ao público.
  // As dimensões batem certo com `app/opengraph-image.jpg` (1200×630), gerado
  // a partir do cartaz do hero; apontar para /hero-poster.jpg diria ao Facebook
  // que é 1200×630 quando o ficheiro é 1600×900.
  openGraph: {
    type: "website",
    siteName: "Pro Capital",
    locale: "pt_MZ",
    url: SITE_URL,
    title: "Pro Capital | Distribuidora de Livros",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Livraria da Pro Capital ao fim da tarde, com estantes cheias de livros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Capital | Distribuidora de Livros",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.jpg"],
  },
  icons: {
    icon: "/procapital/logo.jpg",
    apple: "/procapital/logo.jpg",
  },
  robots: { index: true, follow: true },
};

// Em Next 16, `themeColor`/viewport saíram de `metadata` para `viewport`.
// O tom é o `--ink` da marca porque é sobre o banner (fundo escuro) que a
// barra de endereço do telemóvel aparece em primeiro lugar.
export const viewport: Viewport = {
  themeColor: "#123a44",
  width: "device-width",
  initialScale: 1,
};

// Dados estruturados da organização — ajudam o Google a mostrar o nome,
// logótipo e contactos corretos da Pro Capital nos resultados de pesquisa.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pro Capital, Lda",
  url: SITE_URL,
  logo: `${SITE_URL}/procapital/logo.jpg`,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Gil Vicente, n.º 79, R/C, Bairro Coop",
    addressLocality: "Maputo",
    addressCountry: "MZ",
  },
  email: "geral@procapital.co.mz",
  areaServed: ["MZ", "AO", "PT", "BR"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-MZ"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  {/* Permite a quem navega por teclado ou leitor de ecrã
                      saltar o cabeçalho e ir direto ao conteúdo. */}
                  <a
                    href="#conteudo"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream"
                  >
                    Saltar para o conteúdo
                  </a>
                  <Header />
                  <main id="conteudo" className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </WishlistProvider>
              </CartProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
