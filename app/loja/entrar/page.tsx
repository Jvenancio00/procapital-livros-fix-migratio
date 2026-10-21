"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarForm />
    </Suspense>
  );
}

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/loja/conta";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      totpToken: totpCode.trim() || undefined,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        "Credenciais inválidas ou código 2FA em falta (caso tenha 2FA ativa).",
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <div className="rounded-3xl border border-line bg-white p-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Acesso Seguro
        </span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
          Iniciar sessão
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-ink/65">
          Aceda à sua conta de comprador, encomendas, cotações B2B e biblioteca
          digital.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-ink/75">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-ink/75">Palavra-passe</label>
              <Link
                href="/loja/recuperar-senha"
                className="font-semibold text-brand hover:underline"
              >
                Esqueceu a palavra-passe?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/65">
              Código 2FA (apenas se tiver autenticação em 2 fatores ativa)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Opcional — 6 dígitos"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-4 py-2 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            <span>{loading ? "A entrar..." : "Entrar na Conta"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/65">
          Ainda não tem conta?{" "}
          <Link
            href="/loja/registo"
            className="font-semibold text-brand hover:underline"
          >
            Criar conta pessoal ou B2B
          </Link>
        </p>
      </div>
    </div>
  );
}
