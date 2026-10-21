"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { CLIENT_TYPE_LABELS } from "@/lib/markets";
import type { ClientType } from "@/lib/enums";

interface UserAdminRow {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "CUSTOMER";
  clientProfile: {
    type: ClientType;
    companyName: string | null;
    countryCode: string;
    approvedB2B: boolean;
    discountPercent: number;
    paymentTermsDays: number;
  } | null;
  _count: { orders: number };
}

export default function AdminUtilizadoresPage() {
  const [users, setUsers] = useState<UserAdminRow[]>([]);
  const [savedId, setSavedId] = useState("");

  async function load() {
    const res = await fetch("/api/admin/utilizadores");
    if (!res.ok) return;
    const json = await res.json();
    setUsers(json.users ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(u: UserAdminRow) {
    setSavedId("");
    const res = await fetch("/api/admin/utilizadores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: u.id,
        role: u.role,
        clientType: u.clientProfile?.type ?? "PARTICULAR",
        approvedB2B: u.clientProfile?.approvedB2B ?? false,
        discountPercent: u.clientProfile?.discountPercent ?? 0,
        paymentTermsDays: u.clientProfile?.paymentTermsDays ?? 0,
      }),
    });
    if (res.ok) {
      setSavedId(u.id);
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Permissões, Perfis Compradores &amp; Condições B2B
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Utilizadores, Perfis e Descontos Comerciais ({users.length})
        </h1>
        <p className="mt-1 text-xs text-ink/65">
          Os descontos comerciais são governados exclusivamente por aprovação
          administrativa nesta tabela e nunca aceites do navegador do cliente.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white p-5">
        <table className="w-full min-w-[880px] text-left text-xs">
          <thead className="border-b border-line bg-cream/70 uppercase text-ink/60">
            <tr>
              <th className="px-3 py-3">Utilizador</th>
              <th className="px-3 py-3">Papel</th>
              <th className="px-3 py-3">Perfil Comprador</th>
              <th className="px-3 py-3">B2B Aprovado</th>
              <th className="px-3 py-3">Desconto (%)</th>
              <th className="px-3 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {users.map((u, idx) => {
              const p = u.clientProfile ?? {
                type: "PARTICULAR" as ClientType,
                companyName: null,
                countryCode: "MZ",
                approvedB2B: false,
                discountPercent: 0,
                paymentTermsDays: 0,
              };
              return (
                <tr key={u.id}>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-ink">
                      {u.name ?? u.email}
                    </p>
                    <p className="text-ink/55">
                      {u.email} · {u._count.orders} encomenda(s)
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  role: e.target.value as "ADMIN" | "CUSTOMER",
                                }
                              : x,
                          ),
                        )
                      }
                      className="rounded-xl border border-line bg-cream/40 px-2.5 py-1.5 font-semibold"
                    >
                      <option value="CUSTOMER">Cliente</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={p.type}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  clientProfile: {
                                    ...p,
                                    type: e.target.value as ClientType,
                                  },
                                }
                              : x,
                          ),
                        )
                      }
                      className="rounded-xl border border-line bg-cream/40 px-2.5 py-1.5"
                    >
                      {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map(
                        (t) => (
                          <option key={t} value={t}>
                            {CLIENT_TYPE_LABELS[t]}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={p.approvedB2B}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  clientProfile: {
                                    ...p,
                                    approvedB2B: e.target.checked,
                                  },
                                }
                              : x,
                          ),
                        )
                      }
                      className="accent-brand"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={p.discountPercent}
                      onChange={(e) =>
                        setUsers((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  clientProfile: {
                                    ...p,
                                    discountPercent: Number(e.target.value),
                                  },
                                }
                              : x,
                          ),
                        )
                      }
                      className="w-20 rounded-xl border border-line px-2.5 py-1.5 font-semibold"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSave(u)}
                      className="rounded-full bg-brand px-4 py-1.5 font-semibold text-white hover:bg-brand-dark"
                    >
                      {savedId === u.id ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Guardado
                        </span>
                      ) : (
                        "Guardar"
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
