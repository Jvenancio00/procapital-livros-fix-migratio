"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Send } from "lucide-react";

const MOTIVOS = [
  { label: "Sou uma editora", value: "EDITORA" },
  { label: "Sou uma livraria", value: "LIVRARIA" },
  { label: "Represento uma escola", value: "ESCOLA" },
  { label: "Sou parceiro comercial", value: "PARCEIRO_COMERCIAL" },
  { label: "Interesse em investimento/parceria", value: "INVESTIMENTO" },
  { label: "Sou leitor", value: "LEITOR" },
] as const;

export default function ContactForm() {
  const [motivo, setMotivo] = useState<(typeof MOTIVOS)[number]["value"]>("LEITOR");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const formData = new FormData(event.currentTarget);
    const name = formData.get("nome");
    const email = formData.get("email");
    const phone = formData.get("telefone");
    const company = formData.get("empresa");
    const message = formData.get("mensagem");

    try {
      const res = await fetch("/api/contactos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, message, reason: motivo }),
      });
      if (!res.ok) throw new Error("Falha ao gravar o contacto.");
      setStatus("sent");
    } catch {
      window.location.href = `mailto:comercial@procapitalmz.com?subject=${encodeURIComponent(
        `Contacto do site — ${motivo}`,
      )}&body=${encodeURIComponent(
        `Nome: ${name}\nEmpresa/Instituição: ${company || "-"}\nEmail: ${email}\nTelefone: ${phone || "-"}\n\n${message}`,
      )}`;
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-line bg-cream/60 p-7 text-center sm:p-8">
        <CheckCircle2 size={36} className="mx-auto text-emerald-700" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Mensagem Registada com Sucesso
        </p>
        <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">
          Obrigado pelo seu contacto
        </h3>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-ink/75">
          A equipa comercial e editorial da Pro Capital recebeu o seu pedido.{" "}
          <strong>Respondemos em até 24 horas úteis</strong> (segunda a
          sexta-feira).
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <span>Explorar catálogo</span>
            <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="inline-flex items-center rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40"
          >
            Enviar outra mensagem
          </button>
        </div>
      </div>
    );
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
          Empresa/Instituição
          <input
            name="empresa"
            type="text"
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="Opcional"
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

        <label className="block text-sm font-medium text-foreground/80">
          Telefone
          <input
            name="telefone"
            type="tel"
            className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-foreground outline-none ring-brand/30 focus:ring-2"
            placeholder="Opcional"
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

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {status === "loading" ? "A enviar..." : "Enviar mensagem"}
          <Send size={16} />
        </button>

        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/65">
          <Clock size={14} className="text-brand" aria-hidden="true" />
          <span>Respondemos em até 24 horas úteis.</span>
        </p>
      </div>

      {status === "error" && (
        <p className="text-sm text-foreground/60">
          A abrir o seu cliente de email como alternativa.
        </p>
      )}
    </form>
  );
}
