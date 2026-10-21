"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { CLIENT_TYPE_LABELS, MARKET_LIST } from "@/lib/markets";
import type { ClientType, MarketCode } from "@/lib/enums";

function RegistoFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientType, setClientType] = useState<ClientType>(
    (searchParams.get("perfil") as ClientType) || "PARTICULAR",
  );
  const [countryCode, setCountryCode] = useState<MarketCode>("MZ");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/registo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        clientType,
        countryCode,
        companyName,
        taxId,
        phone,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      router.push("/loja/entrar");
      return;
    }

    router.push("/loja/conta");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-14 sm:px-8">
      <div className="rounded-3xl border border-line bg-white p-7 sm:p-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Registo Comercial &amp; Pessoal
        </span>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
          Criar conta Pro Capital
        </h1>
        <p className="mt-2 text-sm text-ink/65">
          Selecione o seu perfil de comprador para aceder a encomendas, histórico,
          cotações B2B e biblioteca digital.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-ink/75">
              Perfil de Comprador *
            </label>
            <select
              value={clientType}
              onChange={(e) => setClientType(e.target.value as ClientType)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm font-medium text-ink"
            >
              {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((type) => (
                <option key={type} value={type}>
                  {CLIENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/75">
              País Principal *
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value as MarketCode)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm font-medium text-ink"
            >
              {MARKET_LIST.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name} ({m.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ink/75">
              Nome Completo / Responsável *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          {clientType !== "PARTICULAR" && (
            <>
              <div>
                <label className="text-xs font-semibold text-ink/75">
                  Nome da Livraria / Escola / Empresa
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/75">
                  NIF / NUIT / CNPJ
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-ink/75">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/75">
              Telefone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-ink/75">
              Palavra-passe (mín. 8 caracteres) *
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

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 sm:col-span-2">
              {error}
            </p>
          )}

          <div className="pt-2 sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              <span>{loading ? "A criar conta..." : "Criar Conta"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-ink/65">
          Já tem conta?{" "}
          <Link
            href="/loja/entrar"
            className="font-semibold text-brand hover:underline"
          >
            Iniciar sessão
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegistoPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm">A carregar...</div>}>
      <RegistoFormInner />
    </Suspense>
  );
}
