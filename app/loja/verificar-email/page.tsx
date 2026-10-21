"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "A confirmar o seu endereço de email…"
      : "Ligação de verificação em falta ou incompleta.",
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch("/api/auth/verificar-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (res.ok) {
          setStatus("ok");
          setMessage(
            data.message ?? "O seu endereço de email foi confirmado com sucesso.",
          );
        } else {
          setStatus("error");
          setMessage(
            data.error ?? "Não foi possível validar esta ligação de verificação.",
          );
        }
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setMessage("Ocorreu um erro de ligação ao verificar o seu email.");
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "2.5rem auto 4rem",
        padding: "2rem",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        background: "var(--surface)",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
      }}
    >
      <p
        style={{
          fontSize: "0.95rem",
          lineHeight: 1.65,
          color: status === "error" ? "var(--accent)" : "var(--text-primary)",
          marginBottom: "1.5rem",
        }}
      >
        {message}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/loja/entrar" className="btn-primary">
          Iniciar sessão
        </Link>
        <Link href="/catalogo" className="btn-outline">
          Explorar catálogo
        </Link>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Conta Pro Capital"
        title="Verificação de Email"
        description="Confirmação segura de endereço eletrónico para acesso comercial e acompanhamento de encomendas."
      />
      <section className="section-shell">
        <Suspense fallback={<p>A validar ligação…</p>}>
          <VerifyEmailInner />
        </Suspense>
      </section>
    </main>
  );
}
