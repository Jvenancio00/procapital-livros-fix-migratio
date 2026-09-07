import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthProvider from "@/components/AuthProvider";
import { SITE_URL } from "@/lib/site";

// As fontes são carregadas pelo browser através de <link> (ver <head> abaixo)
// em vez de `next/font/google`, que faz fetch a fonts.googleapis.com durante o
// build e por isso rebenta em ambientes sem rede (sandboxes, CI offline).
// Se a rede falhar, `globals.css` define uma pilha de fallback com fontes do
// sistema, por isso o texto nunca fica sem estilo.

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
  openGraph: {
    type: "website",
    siteName: "Pro Capital",
    locale: "pt_MZ",
    url: SITE_URL,
    title: "Pro Capital | Distribuidora de Livros",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/hero-poster.jpg",
        width: 1200,
        height: 630,
        alt: "Catálogo de livros distribuídos pela Pro Capital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Capital | Distribuidora de Livros",
    description: SITE_DESCRIPTION,
    images: ["/hero-poster.jpg"],
  },
  icons: {
    icon: "/procapital/logo.jpg",
    apple: "/procapital/logo.jpg",
  },
  robots: { index: true, follow: true },
};

// Barra de endereço/tema do browser em telemóvel a condizer com o site.
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
    <html lang="pt-MZ" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font --
            no App Router este <head> pertence ao layout raiz, por isso a
            folha de estilos é aplicada a todas as páginas (o aviso da regra
            refere-se ao Pages Router). Não usamos next/font/google porque
            faz fetch na altura do build e falha sem rede. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
        />
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
