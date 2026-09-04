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
  const [session, setSession] = useState<ClientSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setSession(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch("/api/cliente/perfil")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setSession(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, nextAuthSession]);

  const logout = () => {
    setSession(null);
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
