"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

// Corrige "Problema 2 – Não qualifica o contacto": cada motivo segue
// agora um valor guardado (ContactReason), em vez de tudo cair no mesmo
// "Tipo" solto que só servia para compor o assunto do email.
const MOTIVOS = [
  { label: "Quero publicar um livro", value: "PUBLICAR" },
  { label: "Quero comprar livros", value: "COMPRAR" },
  { label: "Quero ser parceiro", value: "PARCERIA" },
  { label: "Quero apoio técnico", value: "SUPORTE_TECNICO" },
  { label: "Informação comercial", value: "COMERCIAL" },
  { label: "Outro assunto", value: "OUTRO" },
] as const;

export default function ContactForm() {
  const [motivo, setMotivo] = useState<(typeof MOTIVOS)[number]["value"]>("COMPRAR");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("nome");
    const email = formData.get("email");
    const message = formData.get("mensagem");

    try {
      const res = await fetch("/api/contactos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, reason: motivo }),
      });
      if (!res.ok) throw new Error("Falha ao gravar o contacto.");
      setStatus("sent");
    } catch {
      // Se a gravação falhar (ex.: sem base de dados configurada), o
      // mailto continua a funcionar como plano B, tal como acontecia antes.
      window.location.href = `mailto:geral@procapital.co.mz?subject=${encodeURIComponent(
        `Contacto do site — ${motivo}`
      )}&body=${encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\n${message}`)}`;
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <span className="block text-sm font-medium text-foreground/80">
          Motivo do contacto
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOTIVOS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMotivo(option.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                motivo === option.value
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
        Mensagem
        <textarea
          required
          name="mensagem"
          rows={5}
          className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
          placeholder="Conte-nos o que procura"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "loading" ? "A enviar..." : "Enviar mensagem"}
        <Send size={16} />
      </button>

      {status === "sent" && (
        <p className="text-sm text-brand">
          Mensagem recebida — vamos responder o mais breve possível.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-foreground/60">
          A abrir o seu cliente de email como alternativa.
        </p>
      )}
    </form>
  );
}
