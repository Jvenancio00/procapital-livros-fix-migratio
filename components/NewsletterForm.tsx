"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Formulário de newsletter do rodapé da homepage.
 *
 * Antes era um `<form>` sem `action` nem `onSubmit`: submeter recarregava
 * a página e o email não ia a lado nenhum. Agora envia para
 * /api/newsletter e dá confirmação visível ao visitante.
 */
export default function NewsletterForm({ source = "homepage" }: { source?: string }) {
  const { dict } = useLanguage();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Não foi possível subscrever. Tente novamente.");
        setState("idle");
        return;
      }

      setState("done");
      setEmail("");
    } catch {
      setError("Sem ligação ao servidor. Verifique a Internet e tente novamente.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p className="flex w-full max-w-sm shrink-0 items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm text-cream sm:w-auto">
        <Check size={16} className="shrink-0 text-accent" />
        Subscrição registada. Obrigado!
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm shrink-0 sm:w-auto"
      noValidate
    >
      <div className="flex items-center gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={dict.home.newsletter.placeholder}
          aria-label={dict.home.newsletter.placeholder}
          aria-invalid={error ? true : undefined}
          className="w-full min-w-0 rounded-full border border-cream/20 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "sending" && <Loader2 size={14} className="animate-spin" />}
          {dict.home.newsletter.button}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 px-2 text-xs text-accent">
          {error}
        </p>
      )}
    </form>
  );
}
