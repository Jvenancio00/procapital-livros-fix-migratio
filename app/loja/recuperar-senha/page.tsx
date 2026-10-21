"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20 sm:px-8">
      <div className="rounded-3xl border border-line bg-white p-8">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Recuperar palavra-passe
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-ink/65">
          Introduza o email associado à sua conta Pro Capital para receber um link
          temporário de reposição.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={15} />
              Pedido processado
            </p>
            <p className="mt-1">
              Caso exista uma conta registada para <strong>{email}</strong> e o
              serviço SMTP esteja ativo, receberá as instruções na sua caixa de
              entrada.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Email da conta
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? "A enviar..." : "Solicitar link de recuperação"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-ink/60">
          <Link href="/loja/entrar" className="font-semibold text-brand hover:underline">
            Voltar ao início de sessão
          </Link>
        </p>
      </div>
    </div>
  );
}
