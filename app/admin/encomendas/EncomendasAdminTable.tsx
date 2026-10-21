"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/markets";
import type { OrderStatus } from "@/lib/enums";

interface OrderItemRow {
  id: string;
  quantity: number;
  unitPrice: string;
  book: { title: string };
}

interface OrderRow {
  id: string;
  orderNumber: string | null;
  status: string;
  paymentStatus: string;
  paymentReference: string | null;
  countryCode: string;
  currency: "KZ" | "MT" | "EUR" | "BRL";
  totalAmount: string;
  trackingCode: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
  items: OrderItemRow[];
}

const ALL_STATUSES: OrderStatus[] = [
  "DRAFT",
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

export default function EncomendasAdminTable({
  encomendas,
}: {
  encomendas: OrderRow[];
}) {
  const [rows, setRows] = useState(encomendas);

  const updateOrder = async (
    id: string,
    payload: { status?: string; trackingCode?: string },
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...payload } : r)),
    );
    await fetch(`/api/admin/encomendas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white p-5">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead className="border-b border-line bg-cream/70 uppercase text-ink/60">
          <tr>
            <th className="px-3 py-3">N.º / Data</th>
            <th className="px-3 py-3">Cliente &amp; Mercado</th>
            <th className="px-3 py-3">Artigos</th>
            <th className="px-3 py-3">Comprovativo / Pagamento</th>
            <th className="px-3 py-3">Total Oficial</th>
            <th className="px-3 py-3">Estado &amp; Expedição</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {rows.map((order) => (
            <tr key={order.id} className="align-top">
              <td className="px-3 py-3.5">
                <p className="font-mono font-semibold text-ink">
                  {order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`}
                </p>
                <p className="text-ink/55">
                  {new Date(order.createdAt).toLocaleString("pt-PT")}
                </p>
              </td>
              <td className="px-3 py-3.5">
                <p className="font-semibold text-ink">
                  {order.user.name ?? "Cliente"}
                </p>
                <p className="text-ink/60">{order.user.email}</p>
                <span className="mt-1 inline-block rounded bg-cream-deep px-2 py-0.5 text-[10px] font-semibold">
                  {order.countryCode} · {order.currency}
                </span>
              </td>
              <td className="px-3 py-3.5 text-ink/80">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.quantity}× {item.book.title}
                  </p>
                ))}
              </td>
              <td className="px-3 py-3.5">
                <p className="font-semibold">{order.paymentStatus}</p>
                <p className="font-mono text-[11px] text-brand">
                  {order.paymentReference ?? "Sem comprovativo submetido"}
                </p>
              </td>
              <td className="px-3 py-3.5 font-serif text-sm font-bold text-ink">
                {formatMoney(Number(order.totalAmount), order.currency)}
              </td>
              <td className="space-y-2 px-3 py-3.5">
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrder(order.id, { status: e.target.value })
                  }
                  className="w-full rounded-xl border border-line bg-cream/50 px-2.5 py-1.5 font-semibold text-ink"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_LABELS[st] ?? st}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Código de rastreio..."
                  defaultValue={order.trackingCode ?? ""}
                  onBlur={(e) => {
                    if (e.target.value !== (order.trackingCode ?? "")) {
                      updateOrder(order.id, {
                        status: order.status,
                        trackingCode: e.target.value,
                      });
                    }
                  }}
                  className="w-full rounded-xl border border-line px-2.5 py-1 text-[11px]"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
