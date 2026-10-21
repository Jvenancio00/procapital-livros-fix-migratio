"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function RedefinirFormInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Token inválido ou expirado.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Falha de rede ao redefinir palavra-passe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20 sm:px-8">
      <div className="rounded-3xl border border-line bg-white p-8">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Definir nova palavra-passe
        </h1>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={15} />
              Palavra-passe atualizada com sucesso.
            </p>
            <Link
              href="/loja/entrar"
              className="inline-block rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white"
            >
              Iniciar sessão
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink/75">
                Nova palavra-passe (mín. 8 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            {error && <p className="text-xs font-semibold text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-full bg-brand px-6 py-3 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? "A guardar..." : "Atualizar palavra-passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">A carregar...</div>}>
      <RedefinirFormInner />
    </Suspense>
  );
}
