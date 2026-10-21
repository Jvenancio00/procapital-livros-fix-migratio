"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error ?? "Não foi possível registar o email.");
        return;
      }
      setStatus("success");
      setMessage(json.message ?? "Subscrição confirmada.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Erro de ligação ao servidor. Tente novamente.");
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
        aria-label="Subscrição de boletim editorial"
      >
        <div className="relative flex-1">
          <Mail
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
            aria-hidden="true"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="O seu email profissional ou institucional..."
            aria-label="Endereço de email"
            className="w-full rounded-full border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/55 focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {status === "loading" ? "A subscrever..." : "Subscrever boletim"}
        </button>
      </form>

      {status === "success" && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>{message}</span>
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-xs font-medium text-amber-300">{message}</p>
      )}
    </div>
  );
}
