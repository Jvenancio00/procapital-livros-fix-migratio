"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ShieldCheck, ShieldOff, History } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface LoginEventDTO {
  id: string;
  createdAt: string;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
}

export default function SegurancaPage() {
  const { status } = useSession();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<LoginEventDTO[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/loja/entrar?callbackUrl=/loja/seguranca");
  }, [status]);

  useEffect(() => {
    fetch("/api/conta/acessos")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .catch(() => {});
  }, []);

  const startSetup = async () => {
    setMessage(null);
    const res = await fetch("/api/auth/2fa", { method: "POST" });
    const data = await res.json();
    setQrCodeDataUrl(data.qrCodeDataUrl);
  };

  const confirmSetup = async () => {
    const res = await fetch("/api/auth/2fa", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      setEnabled(true);
      setQrCodeDataUrl(null);
      setMessage("Autenticação em dois fatores ativada com sucesso.");
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Código inválido.");
    }
  };

  const disable2fa = async () => {
    await fetch("/api/auth/2fa", { method: "DELETE" });
    setEnabled(false);
    setMessage("Autenticação em dois fatores desativada.");
  };

  return (
    <main>
      <PageHeader
        eyebrow="Proteção de Conta & Auditoria"
        title="Segurança e 2FA"
        description="Proteja a sua conta comercial ou administrativa com autenticação TOTP (Google Authenticator / Authy) e consulte o registo de acessos."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <section className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-2.5">
            {enabled ? (
              <ShieldCheck size={19} className="text-brand" />
            ) : (
              <ShieldOff size={19} className="text-ink/40" />
            )}
            <h2 className="font-serif text-lg font-semibold text-ink">
              Autenticação em Dois Fatores (TOTP)
            </h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink/65">
            Compatível com Google Authenticator, Authy, 1Password ou Microsoft
            Authenticator sem dependência de SMS.
          </p>

          {message && (
            <p className="mt-3 text-xs font-semibold text-brand">{message}</p>
          )}

          {!enabled && !qrCodeDataUrl && (
            <button
              onClick={startSetup}
              className="mt-4 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              Configurar 2FA
            </button>
          )}

          {qrCodeDataUrl && (
            <div className="mt-5 space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- QR data URL gerada localmente pelo servidor */}
              <img
                src={qrCodeDataUrl}
                alt="Código QR para configuração 2FA"
                className="h-44 w-44 rounded-xl border border-line p-2"
              />
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Código de 6 dígitos"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="rounded-full border border-line px-4 py-2 text-sm text-ink"
                />
                <button
                  onClick={confirmSetup}
                  className="rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                >
                  Confirmar código
                </button>
              </div>
            </div>
          )}

          {enabled && (
            <button
              onClick={disable2fa}
              className="mt-4 rounded-full border border-line px-5 py-2 text-xs font-semibold text-ink hover:border-brand/50"
            >
              Desativar 2FA
            </button>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-2">
            <History size={18} className="text-ink/50" />
            <h2 className="font-serif text-lg font-semibold text-ink">
              Histórico Recente de Acessos
            </h2>
          </div>

          {events.length === 0 ? (
            <p className="mt-4 text-xs text-ink/55">
              Sem registos de acesso recentes para apresentar.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-xs">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <span className="text-ink/75">
                    {new Date(ev.createdAt).toLocaleString("pt-PT")} ·{" "}
                    {ev.ip ?? "IP não registado"}
                  </span>
                  <span
                    className={
                      ev.success
                        ? "font-semibold text-emerald-700"
                        : "font-semibold text-brand"
                    }
                  >
                    {ev.success ? "Autorizado" : "Recusado"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
