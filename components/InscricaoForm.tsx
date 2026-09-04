"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2, Clock } from "lucide-react";

export default function InscricaoForm({
  eventoSlug,
  esgotado,
}: {
  eventoSlug: string;
  esgotado: boolean;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "confirmada" | "lista_espera" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      telefone: formData.get("telefone"),
    };

    try {
      const res = await fetch(`/api/eventos/${eventoSlug}/inscricao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Não foi possível concluir a inscrição.");
      }

      setQrCodeDataUrl(data.qrCodeDataUrl ?? null);
      setStatus(data.estado === "LISTA_ESPERA" ? "lista_espera" : "confirmada");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  if (status === "confirmada") {
    return (
      <div className="rounded-2xl border border-line bg-cream-deep/60 p-6 text-center">
        <CheckCircle2 size={28} className="mx-auto text-brand" />
        <p className="mt-3 font-serif text-base font-semibold text-ink">
          Inscrição confirmada!
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          Enviámos os detalhes para o seu email. Até lá!
        </p>
        {qrCodeDataUrl && (
          <div className="mt-4 flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeDataUrl} alt="QR Code de check-in" width={140} height={140} />
            <p className="text-xs text-foreground/50">Mostre este código à chegada ao evento.</p>
          </div>
        )}
        <a
          href={`/api/eventos/${eventoSlug}/ics`}
          className="mt-4 inline-block text-xs font-medium text-brand hover:underline"
        >
          Adicionar ao calendário
        </a>
      </div>
    );
  }

  if (status === "lista_espera") {
    return (
      <div className="rounded-2xl border border-line bg-cream-deep/60 p-6 text-center">
        <Clock size={28} className="mx-auto text-accent" />
        <p className="mt-3 font-serif text-base font-semibold text-ink">
          Ficou na lista de espera
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          As vagas confirmadas estão esgotadas. Avisamos por email se surgir
          uma vaga.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground/80">
          Nome
          <input
            required
            name="nome"
            type="text"
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="O seu nome"
          />
        </label>
        <label className="block text-sm font-medium text-foreground/80">
          Email
          <input
            required
            name="email"
            type="email"
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="oseu@email.com"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-foreground/80">
        Telefone (opcional)
        <input
          name="telefone"
          type="tel"
          className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
          placeholder="+258 ..."
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "loading"
          ? "A inscrever..."
          : esgotado
            ? "Entrar na lista de espera"
            : "Confirmar inscrição"}
        <Send size={16} />
      </button>

      {status === "error" && <p className="text-sm text-brand">{errorMsg}</p>}
    </form>
  );
}
