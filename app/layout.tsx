import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MobileStickyCta from "@/components/MobileStickyCta";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthProvider from "@/components/AuthProvider";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_OG_IMAGE, buildGlobalOrganizationJsonLd } from "@/lib/seo";

const fraunces = localFont({
  src: "./fonts/fraunces-latin-wght.woff2",
  variable: "--font-fraunces",
  weight: "500 700",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pro Capital | Distribuidora de Livros em Moçambique e na CPLP",
    template: "%s | Pro Capital",
  },
  description:
    "Pro Capital conecta editoras, livrarias, escolas e leitores através de uma rede de distribuição editorial preparada para Moçambique, Angola, Portugal e Brasil.",
  openGraph: {
    title: "Pro Capital | Distribuidora de Livros em Moçambique e na CPLP",
    description:
      "Pro Capital conecta editoras, livrarias, escolas e leitores através de uma rede de distribuição editorial preparada para Moçambique, Angola, Portugal e Brasil.",
    url: SITE_URL,
    siteName: "Pro Capital",
    images: [DEFAULT_OG_IMAGE],
    locale: "pt_MZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Capital | Distribuidora de Livros em Moçambique e na CPLP",
    description:
      "Pro Capital conecta editoras, livrarias, escolas e leitores através de uma rede de distribuição editorial preparada para Moçambique, Angola, Portugal e Brasil.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalJsonLd = buildGlobalOrganizationJsonLd();

  return (
    <html
      lang="pt-MZ"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        <GoogleAnalytics />
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <MobileStickyCta />
                </WishlistProvider>
              </CartProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
