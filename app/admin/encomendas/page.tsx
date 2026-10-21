import { prisma } from "@/lib/prisma";
import EncomendasAdminTable from "./EncomendasAdminTable";

export const dynamic = "force-dynamic";

export default async function AdminEncomendasPage() {
  const encomendas = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { book: { select: { title: true } } } },
    },
  });

  const serialized = encomendas.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentReference: o.paymentReference,
    countryCode: o.countryCode,
    currency: o.currency,
    totalAmount: o.totalAmount.toString(),
    trackingCode: o.notes,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toString(),
      book: { title: i.titleSnapshot || i.book.title },
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          Faturação, Comprovativos &amp; Expedição
        </span>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">
          Gestão de Encomendas e Validação de Pagamentos ({serialized.length})
        </h1>
        <p className="mt-1 text-xs text-ink/65">
          Ao confirmar o estado como <strong>Paga</strong>, o stock reservado é
          abatido definitivamente e a biblioteca/email do cliente são atualizados.
          Ao cancelar ou reembolsar, o stock retorna automaticamente ao armazém.
        </p>
      </div>

      <EncomendasAdminTable encomendas={serialized} />
    </div>
  );
}
