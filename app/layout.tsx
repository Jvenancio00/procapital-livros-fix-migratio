import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthProvider from "@/components/AuthProvider";
import { SITE_URL } from "@/lib/site";

// next/font/google exige rede (fonts.googleapis.com) no build — falha em sandboxes offline/E2B.
// Mock local para build/dev offline; em produção com rede, troque pelo bloco abaixo:
// import { Fraunces, Inter } from "next/font/google";
// const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["500","600","700"] });
// const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = { variable: "" } as unknown as { variable: string };
const inter = { variable: "" } as unknown as { variable: string };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Pro Capital | Distribuidora de Livros",
  description:
    "Pro Capital é uma distribuidora de livros sediada em Moçambique, com atuação em Moçambique, Angola, Portugal, Brasil e demais países da CPLP, ao serviço de livrarias, escolas e do público em geral.",
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
