"use client";

import { useState } from "react";

interface Pedido {
  id: string;
  nome: string;
  instituicao: string;
  tipo: string;
  email: string;
  numAlunos: number | null;
  estado: string;
  createdAt: string;
}

const ESTADOS = ["PENDENTE", "EM_ANALISE", "APROVADO", "REJEITADO"];

export default function ConveniosAdminTable({ pedidos }: { pedidos: Pedido[] }) {
  const [rows, setRows] = useState(pedidos);

  const updateEstado = async (id: string, estado: string) => {
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
    await fetch(`/api/convenios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-foreground/50">
            <th className="py-2 pr-4">Instituição</th>
            <th className="py-2 pr-4">Tipo</th>
            <th className="py-2 pr-4">Contacto</th>
            <th className="py-2 pr-4">Recebido em</th>
            <th className="py-2 pr-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-line/60">
              <td className="py-2 pr-4">{p.instituicao}</td>
              <td className="py-2 pr-4">{p.tipo}</td>
              <td className="py-2 pr-4">
                {p.nome}
                <br />
                <span className="text-foreground/50">{p.email}</span>
              </td>
              <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleDateString("pt-PT")}</td>
              <td className="py-2 pr-4">
                <select
                  value={p.estado}
                  onChange={(e) => updateEstado(p.id, e.target.value)}
                  className="rounded-lg border border-line px-2 py-1 text-xs"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="mt-6 text-foreground/50">Ainda sem pedidos.</p>}
    </div>
  );
}
