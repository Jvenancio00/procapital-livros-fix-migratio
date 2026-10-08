import type { Metadata } from "next";
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
    default: "Pro Capital | Distribuição Editorial na CPLP",
    template: "%s | Pro Capital",
  },
  description:
    "Pro Capital conecta editoras, livrarias, escolas e leitores através de uma rede de distribuição editorial preparada para a CPLP.",
  openGraph: {
    title: "Pro Capital | Distribuição Editorial na CPLP",
    description:
      "Pro Capital conecta editoras, livrarias, escolas e leitores através de uma rede de distribuição editorial preparada para a CPLP.",
    url: SITE_URL,
    siteName: "Pro Capital",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "pt_MZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pro Capital | Distribuição Editorial na CPLP",
    description:
      "Pro Capital conecta editoras, livrarias, escolas e leitores através de uma rede de distribuição editorial preparada para a CPLP.",
    images: ["/og-image.jpg"],
  },
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
