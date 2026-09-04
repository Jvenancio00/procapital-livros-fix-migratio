"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ShieldCheck, ShieldOff, History } from "lucide-react";

// Corrige "Problema 2 – Segurança" e "Problema 4 – Roles" da secção
// Entrar: ecrã onde o utilizador ativa 2FA e vê o histórico de acessos.
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
    if (status === "unauthenticated") redirect("/loja/entrar");
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
      setMessage("Autenticação em dois fatores ativada.");
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
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink">Segurança da conta</h1>

      <section className="mt-8 rounded-2xl border border-line p-6">
        <div className="flex items-center gap-2">
          {enabled ? <ShieldCheck size={18} className="text-brand" /> : <ShieldOff size={18} className="text-foreground/40" />}
          <h2 className="font-serif text-lg font-semibold text-ink">
            Autenticação em dois fatores (2FA)
          </h2>
        </div>
        <p className="mt-2 text-sm text-foreground/60">
          Usa uma app como Google Authenticator ou Authy. Não depende de SMS.
        </p>

        {message && <p className="mt-3 text-sm text-brand">{message}</p>}

        {!enabled && !qrCodeDataUrl && (
          <button
            onClick={startSetup}
            className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-dark"
          >
            Ativar 2FA
          </button>
        )}

        {qrCodeDataUrl && (
          <div className="mt-4 flex flex-col items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeDataUrl} alt="QR Code para configurar 2FA" width={180} height={180} />
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Código de 6 dígitos"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
            <button
              onClick={confirmSetup}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream hover:bg-brand-dark"
            >
              Confirmar e ativar
            </button>
          </div>
        )}

        {enabled && (
          <button
            onClick={disable2fa}
            className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-red-300"
          >
            Desativar 2FA
          </button>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-line p-6">
        <div className="flex items-center gap-2">
          <History size={18} className="text-foreground/50" />
          <h2 className="font-serif text-lg font-semibold text-ink">Histórico de acessos</h2>
        </div>
        <ul className="mt-4 divide-y divide-line text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2">
              <span>{new Date(e.createdAt).toLocaleString("pt-PT")}</span>
              <span className={e.success ? "text-foreground/60" : "text-red-500"}>
                {e.success ? "Sucesso" : "Falhou"} · {e.ip ?? "IP desconhecido"}
              </span>
            </li>
          ))}
          {events.length === 0 && <li className="py-2 text-foreground/50">Sem registos ainda.</li>}
        </ul>
      </section>
    </div>
  );
}
