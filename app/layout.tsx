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

// Fontes self-hosted via `next/font/local` (os .woff2 estão em `app/fonts`).
//
// Porque não `next/font/google`? Porque esse import faz fetch a
// fonts.googleapis.com *durante o build*: em CI/sandboxes sem acesso a esse
// host o build rebentava ("Failed to fetch `Fraunces`"). O workaround anterior
// era um mock (`{ variable: "" }`) que deixava o site a renderizar em Arial na
// Vercel — ou seja, a tipografia de marca desaparecia em produção. Com
// self-hosting: zero pedidos externos no build e em runtime, ficheiros
// pré-carregados e com `size-adjust` (sem layout shift), e funciona igual em
// Vercel, sandbox e CI offline.
//
// Subconjuntos: latin + latin-ext (cobre acentos de PT/EN/ES/FR); os pesos
// variáveis 100–900 evitam carregar um ficheiro por peso.
const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "Times New Roman"],
  // O `size-adjust` do Next é calculado contra uma métrica de referência:
  // para uma serifada de texto, "Times New Roman" aproxima-se muito mais do
  // Georgia (fallback real) do que o Arial por omissão — evita o salto de
  // tamanho nos títulos do hero quando o webfont entra.
  adjustFontFallback: "Times New Roman",
  src: [
    {
      path: "./fonts/fraunces-latin-wght.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/fraunces-latin-ext-wght.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "Arial"],
  src: [
    {
      path: "./fonts/inter-latin-wght.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-ext-wght.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pro Capital | Distribuidora de Livros",
  description:
    "Pro Capital é uma distribuidora de livros sediada em Moçambique, com atuação em Moçambique, Angola, Portugal, Brasil e demais países da CPLP, ao serviço de livrarias, escolas e do público em geral.",
};

// Em Next 16, `themeColor`/viewport saíram de `metadata` para `viewport`.
export const viewport: Viewport = {
  themeColor: "#0b262d",
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
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
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
