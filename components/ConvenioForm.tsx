"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const TIPOS = [
  { value: "ESCOLA", label: "Escola" },
  { value: "UNIVERSIDADE", label: "Universidade" },
  { value: "LIVRARIA", label: "Livraria" },
  { value: "EDITORA", label: "Editora" },
  { value: "OUTRO", label: "Outra instituição" },
] as const;

export default function ConvenioForm() {
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["value"]>("ESCOLA");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      nome: formData.get("nome"),
      instituicao: formData.get("instituicao"),
      tipo,
      email: formData.get("email"),
      telefone: formData.get("telefone"),
      numAlunos: formData.get("numAlunos") || undefined,
      mensagem: formData.get("mensagem"),
    };

    try {
      const res = await fetch("/api/convenios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível enviar o pedido.");
      }

      setStatus("sent");
      event.currentTarget.reset();
      setTipo("ESCOLA");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-cream-deep/60 p-8 text-center">
        <CheckCircle2 size={32} className="mx-auto text-brand" />
        <p className="mt-4 font-serif text-lg font-semibold text-ink">
          Pedido recebido!
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          A nossa equipa comercial entrará em contacto em breve para discutir as
          condições do convénio.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <span className="block text-sm font-medium text-foreground/80">
          Tipo de instituição
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIPOS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTipo(option.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                tipo === option.value
                  ? "border-brand bg-brand text-cream"
                  : "border-line bg-cream text-foreground/70 hover:border-brand/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-foreground/80">
          Nome da instituição
          <input
            required
            name="instituicao"
            type="text"
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="Ex.: Escola Secundária da Matola"
          />
        </label>

        <label className="block text-sm font-medium text-foreground/80">
          Pessoa de contacto
          <input
            required
            name="nome"
            type="text"
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="O seu nome"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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

        <label className="block text-sm font-medium text-foreground/80">
          Telefone
          <input
            name="telefone"
            type="tel"
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="+258 ..."
          />
        </label>
      </div>

      {(tipo === "ESCOLA" || tipo === "UNIVERSIDADE") && (
        <label className="block text-sm font-medium text-foreground/80">
          Número aproximado de alunos
          <input
            name="numAlunos"
            type="number"
            min={1}
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="Ex.: 500"
          />
        </label>
      )}

      <label className="block text-sm font-medium text-foreground/80">
        Mensagem (opcional)
        <textarea
          name="mensagem"
          rows={4}
          className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
          placeholder="Conte-nos as necessidades da sua instituição"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "loading" ? "A enviar..." : "Solicitar convénio"}
        <Send size={16} />
      </button>

      {status === "error" && (
        <p className="text-sm text-brand">{errorMsg}</p>
      )}
    </form>
  );
}
