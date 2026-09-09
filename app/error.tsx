"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Fronteira de erro global: se uma página falhar (ex.: base de dados
// indisponível), o visitante vê uma mensagem da Pro Capital com opção de
// tentar novamente, em vez do ecrã de erro cru do Next.js.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção, o `digest` é a única referência que liga este ecrã ao
    // erro real registado no servidor — útil para o suporte.
    console.error("[procapital] erro na renderização da página:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:py-32">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
        <AlertTriangle size={28} strokeWidth={1.75} />
      </span>

      <h1 className="mt-6 font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        Algo correu mal deste lado
      </h1>

      <p className="mt-4 max-w-md text-foreground/70">
        Não foi possível carregar esta página. Já registámos o problema — tente
        novamente dentro de instantes ou contacte-nos se persistir.
      </p>

      {error.digest && (
        <p className="mt-3 text-xs text-foreground/40">
          Referência do erro: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
        >
          <RotateCcw size={16} />
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
        >
          Voltar à página inicial
        </Link>
      </div>
    </div>
  );
}
