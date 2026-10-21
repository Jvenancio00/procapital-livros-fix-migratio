"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";

interface EmailLogRow {
  id: string;
  template: string;
  recipient: string;
  subject: string;
  status: string;
  provider: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface AuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorEmail: string | null;
  createdAt: string;
}

export default function AdminNotificacoesPage() {
  const [provider, setProvider] = useState("none");
  const [emailLogs, setEmailLogs] = useState<EmailLogRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [testTo, setTestTo] = useState("");
  const [testStatus, setTestStatus] = useState("");

  async function load() {
    const res = await fetch("/api/admin/notificacoes");
    if (!res.ok) return;
    const json = await res.json();
    setProvider(json.provider ?? "none");
    setEmailLogs(json.emailLogs ?? []);
    setAuditLogs(json.auditLogs ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleTestSend(e: React.FormEvent) {
    e.preventDefault();
    setTestStatus("A testar envio...");
    const res = await fetch("/api/admin/notificacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: testTo || undefined }),
    });
    const json = await res.json();
    setTestStatus(
      json.sent
        ? `Email enviado com sucesso via ${json.provider}.`
        : `Não enviado: ${json.error ?? "Serviço de email não configurado no .env."}`,
    );
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Comunicações Transacionais &amp; Governança
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Registo de Emails e Logs de Auditoria
        </h1>
      </div>

      {/* Diagnóstico Real do Serviço de Email */}
      <form
        onSubmit={handleTestSend}
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6 text-xs"
      >
        <div>
          <p className="font-semibold text-ink">
            Fornecedor Transacional Ativo:{" "}
            <strong className="uppercase text-brand">{provider}</strong>
          </p>
          <p className="mt-0.5 text-ink/60">
            Configure <code>SMTP_HOST</code> / <code>SMTP_USER</code> /{" "}
            <code>SMTP_PASS</code> ou <code>RESEND_API_KEY</code> no ambiente de
            produção. Sem credenciais, os eventos são registados honestamente como{" "}
            <code>UNCONFIGURED</code>.
          </p>
          {testStatus && (
            <p className="mt-2 font-semibold text-ink">{testStatus}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="email"
            placeholder="Email destino de teste..."
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            className="rounded-xl border border-line bg-cream/40 px-3 py-2"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            <Send size={13} />
            <span>Testar Envio</span>
          </button>
        </div>
      </form>

      {/* Logs de Emails */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">
          Histórico de Notificações por Email ({emailLogs.length})
        </h2>
        <div className="mt-4 max-h-80 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream uppercase text-ink/60">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Template</th>
                <th className="px-3 py-2">Destinatário</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Detalhe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {emailLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2">
                    {new Date(log.createdAt).toLocaleString("pt-PT")}
                  </td>
                  <td className="px-3 py-2 font-mono">{log.template}</td>
                  <td className="px-3 py-2">{log.recipient}</td>
                  <td className="px-3 py-2 font-semibold">{log.status}</td>
                  <td className="px-3 py-2 text-ink/60">
                    {log.errorMessage ?? log.provider ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs de Auditoria */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">
          Registo Auditável de Ações Administrativas ({auditLogs.length})
        </h2>
        <div className="mt-4 max-h-80 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream uppercase text-ink/60">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Ação</th>
                <th className="px-3 py-2">Entidade</th>
                <th className="px-3 py-2">Administrador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {auditLogs.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2">
                    {new Date(a.createdAt).toLocaleString("pt-PT")}
                  </td>
                  <td className="px-3 py-2 font-mono font-semibold text-ink">
                    {a.action}
                  </td>
                  <td className="px-3 py-2">
                    {a.entityType} {a.entityId ? `(${a.entityId.slice(-8)})` : ""}
                  </td>
                  <td className="px-3 py-2">{a.actorEmail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
