"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "@/hooks/useClientAuth";
import { exportOrderPDF, exportOrderWord, exportOrderExcel } from "@/lib/export-order";
import { ArrowLeft, FileText, Download } from "lucide-react";
import type { Book } from "@/data/books";

interface OrderItem extends Book {
  quantity: number;
}

export default function ClientOrderPage() {
  const router = useRouter();
  const { session, loading } = useClientAuth();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/cliente/login");
      return;
    }

    // Load cart from sessionStorage or localStorage
    const storedCart = sessionStorage.getItem("client-cart");
    if (storedCart) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação única do carrinho a partir do sessionStorage
        setCart(JSON.parse(storedCart));
      } catch {
        // Cart data error
      }
    }
  }, [session, loading, router]);

  if (loading || !session || cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          {loading || !session ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
              <p className="text-foreground/60">A carregar...</p>
            </>
          ) : (
            <>
              <p className="text-foreground/60 mb-4">Carrinho vazio</p>
              <button
                onClick={() => router.push("/cliente/catalogo")}
                className="text-brand hover:text-brand-dark font-medium"
              >
                Voltar ao catálogo
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const totalPrice = cart.reduce((sum, item) => {
    const discountedPrice = item.price * (1 - session.discount / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  const saveAsLastOrder = () => {
    try {
      localStorage.setItem(
        `last-order-${session.id}`,
        JSON.stringify({ cart, savedAt: new Date().toISOString() })
      );
    } catch {
      // Armazenamento indisponível — não bloqueia a exportação
    }
  };

  const handleExportPDF = async () => {
    setExporting("pdf");
    try {
      exportOrderPDF(cart, session, totalPrice);
      saveAsLastOrder();
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    }
    setExporting(null);
  };

  const handleExportWord = async () => {
    setExporting("word");
    try {
      await exportOrderWord(cart, session, totalPrice);
      saveAsLastOrder();
    } catch (error) {
      console.error("Erro ao exportar Word:", error);
    }
    setExporting(null);
  };

  const handleExportExcel = async () => {
    setExporting("excel");
    try {
      exportOrderExcel(cart, session, totalPrice);
      saveAsLastOrder();
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
    }
    setExporting(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-brand/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/cliente/catalogo")}
            className="flex items-center gap-2 px-4 py-2 text-foreground/60 hover:text-ink hover:bg-cream rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <h1 className="text-xl font-serif font-bold text-ink flex-1">Gerar Encomenda</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info */}
        <div className="bg-white rounded-xl border border-cream p-6 mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4">Informações da Encomenda</h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Empresa</p>
              <p className="font-semibold text-ink">{session.company}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Email</p>
              <p className="font-semibold text-ink">{session.email}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Tipo</p>
              <p className="font-semibold text-ink">
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Desconto Aplicado</p>
              <p className="font-semibold text-brand text-lg">{session.discount}%</p>
            </div>
          </div>

          <p className="text-sm text-foreground/60">
            Data da encomenda:{" "}
            <span className="font-semibold text-ink">
              {new Date().toLocaleDateString("pt-PT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-cream p-6 mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4">Artigos</h2>

          <div className="space-y-4">
            {cart.map((item) => {
              const originalPrice = item.price;
              const discountedPrice = originalPrice * (1 - session.discount / 100);
              const savings = originalPrice - discountedPrice;

              return (
                <div key={item.slug} className="flex items-center justify-between py-4 border-b border-cream/50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="text-sm text-foreground/60">{item.author}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-foreground/60">Quantidade: {item.quantity}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-bold text-brand">
                        {(discountedPrice * item.quantity).toFixed(2)} MT
                      </span>
                      <span className="text-xs text-foreground/50 line-through">
                        {(originalPrice * item.quantity).toFixed(2)} MT
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Economiza: {(savings * item.quantity).toFixed(2)} MT
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-brand">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold text-ink">Total:</span>
              <span className="text-3xl font-bold text-brand">{totalPrice.toFixed(2)} MT</span>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl border border-cream p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Download size={20} className="text-brand" />
            <h2 className="text-lg font-semibold text-ink">Exportar Encomenda</h2>
          </div>

          <p className="text-sm text-foreground/60 mb-6">
            Escolha o formato para descarregar a sua nota de encomenda com os preços e desconto já
            aplicados.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* PDF */}
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="flex flex-col items-center gap-3 p-6 border-2 border-brand/20 rounded-xl hover:border-brand hover:bg-brand/5 transition-all disabled:opacity-50"
            >
              <FileText size={32} className="text-brand" />
              <span className="font-semibold text-ink">PDF</span>
              <span className="text-xs text-foreground/60">Documento profissional</span>
              {exporting === "pdf" && (
                <span className="text-xs text-brand font-medium">A exportar...</span>
              )}
            </button>

            {/* Word */}
            <button
              onClick={handleExportWord}
              disabled={exporting !== null}
              className="flex flex-col items-center gap-3 p-6 border-2 border-brand/20 rounded-xl hover:border-brand hover:bg-brand/5 transition-all disabled:opacity-50"
            >
              <FileText size={32} className="text-brand" />
              <span className="font-semibold text-ink">Word</span>
              <span className="text-xs text-foreground/60">Editável e personalizável</span>
              {exporting === "word" && (
                <span className="text-xs text-brand font-medium">A exportar...</span>
              )}
            </button>

            {/* Excel */}
            <button
              onClick={handleExportExcel}
              disabled={exporting !== null}
              className="flex flex-col items-center gap-3 p-6 border-2 border-brand/20 rounded-xl hover:border-brand hover:bg-brand/5 transition-all disabled:opacity-50"
            >
              <FileText size={32} className="text-brand" />
              <span className="font-semibold text-ink">Excel</span>
              <span className="text-xs text-foreground/60">Para análise e integração</span>
              {exporting === "excel" && (
                <span className="text-xs text-brand font-medium">A exportar...</span>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/cliente/catalogo")}
            className="flex-1 px-6 py-3 border-2 border-brand text-brand font-semibold rounded-lg hover:bg-brand/5 transition-colors"
          >
            Voltar ao Catálogo
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("client-cart");
              router.push("/cliente/catalogo");
            }}
            className="flex-1 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg transition-colors"
          >
            Limpar Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
