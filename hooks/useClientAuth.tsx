"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export interface ClientSession {
  id: string;
  email: string;
  company: string;
  type: string;
  discount: number;
  loginTime: string;
}

/**
 * Corrige o achado de dois sistemas de autenticação paralelos: deixou de
 * haver uma "sessão" fabricada em localStorage a partir de uma lista fixa
 * de emails (data/authorized-clients.ts). Agora usa-se a mesma sessão
 * NextAuth de /loja/entrar, e os dados comerciais (empresa, tipo, desconto)
 * vêm de /api/cliente/perfil, que lê o ClientProfile ligado ao User real.
 */
export function useClientAuth() {
  const { data: nextAuthSession, status } = useSession();
  const [profile, setProfile] = useState<ClientSession | null>(null);
  // "idle" antes de haver sessão, "loading" durante o pedido ao perfil.
  const [profileState, setProfileState] = useState<"idle" | "loading" | "done">(
    "idle"
  );

  useEffect(() => {
    // Enquanto o NextAuth não decidir, ou se não houver sessão, não há
    // nada a ir buscar — o estado derivado abaixo trata desses casos sem
    // chamadas a setState durante o efeito (evita renders em cascata).
    if (status !== "authenticated") return;

    let cancelled = false;
    const request = fetch("/api/cliente/perfil")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    request.then((data: ClientSession | null) => {
      if (cancelled) return;
      setProfile(data);
      setProfileState("done");
    });

    return () => {
      cancelled = true;
    };
  }, [status, nextAuthSession]);

  // Derivado da sessão NextAuth: sem sessão não há perfil, e só deixamos
  // de estar "a carregar" quando o pedido ao perfil termina.
  const session = status === "authenticated" ? profile : null;
  const loading =
    status === "loading" ||
    (status === "authenticated" && profileState !== "done");

  const logout = () => {
    setProfile(null);
    setProfileState("idle");
    signOut({ callbackUrl: "/loja/entrar" });
  };

  return { session, loading, logout };
}

export function ProtectedClientRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push("/cliente/login");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-foreground/60">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
