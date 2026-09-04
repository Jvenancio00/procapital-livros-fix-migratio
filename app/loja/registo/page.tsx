"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

export default function RegistoPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A password deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/registo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      router.push("/loja/entrar");
      return;
    }

    router.push("/loja/biblioteca");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink">Criar conta</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Guarda os teus livros comprados e gratuitos na tua biblioteca pessoal.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Nome
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-brand/40 focus:outline-none"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line bg-cream px-4 py-3 text-sm text-ink focus:border-brand/40 focus:outline-none"
          />
          <p className="mt-1 text-xs text-foreground/45">Mínimo 8 caracteres.</p>
        </div>

        {error && <p className="text-sm text-brand">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "A criar conta..." : "Criar conta"}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Já tens conta?{" "}
        <Link href="/loja/entrar" className="font-medium text-brand hover:underline">
          Entra aqui
        </Link>
      </p>
    </div>
  );
}
