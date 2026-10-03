"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/currency";

interface OrderItemRow {
  id: string;
  quantity: number;
  unitPrice: string;
  book: { title: string };
}

interface OrderRow {
  id: string;
  status: string;
  currency: "KZ" | "MT" | "EUR" | "BRL";
  totalAmount: string;
  createdAt: string;
  user: { name: string | null; email: string };
  items: OrderItemRow[];
}

const ESTADOS = ["PENDING", "PAID", "CANCELLED"];
const ESTADO_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELLED: "Cancelado",
};

export default function EncomendasAdminTable({ encomendas }: { encomendas: OrderRow[] }) {
  const [rows, setRows] = useState(encomendas);

  const updateStatus = async (id: string, status: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch(`/api/admin/encomendas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-foreground/50">
            <th className="py-2 pr-4">Cliente</th>
            <th className="py-2 pr-4">Artigos</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Recebida em</th>
            <th className="py-2 pr-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.id} className="border-b border-line/60 align-top">
              <td className="py-3 pr-4">
                {order.user.name ?? order.user.email}
                <br />
                <span className="text-foreground/50">{order.user.email}</span>
              </td>
              <td className="py-3 pr-4">
                {order.items.map((item) => (
                  <div key={item.id} className="text-foreground/70">
                    {item.quantity}× {item.book.title}
                  </div>
                ))}
              </td>
              <td className="py-3 pr-4 font-medium text-ink">
                {formatMoney(Number(order.totalAmount), order.currency)}
              </td>
              <td className="py-3 pr-4">
                {new Date(order.createdAt).toLocaleDateString("pt-PT")}
              </td>
              <td className="py-3 pr-4">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="rounded-lg border border-line px-2 py-1 text-xs"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {ESTADO_LABEL[estado]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
