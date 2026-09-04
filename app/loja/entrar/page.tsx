"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/loja/biblioteca";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou password incorretos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink">Entrar</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Acede à tua biblioteca pessoal e ao histórico de compras.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-brand/40 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-brand/40 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-brand">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "A entrar..." : "Entrar"}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Ainda não tens conta?{" "}
        <Link href="/loja/registo" className="font-medium text-brand hover:underline">
          Cria uma agora
        </Link>
      </p>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-5 py-16 text-center text-sm text-foreground/60">A carregar...</div>}>
      <EntrarForm />
    </Suspense>
  );
}
