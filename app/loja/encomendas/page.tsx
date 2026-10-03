import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELLED: "Cancelado",
};

export default async function MinhasEncomendasPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/loja/entrar?callbackUrl=/loja/encomendas");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });

  const orders = user?.orders ?? [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
        As minhas encomendas
      </h1>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-line bg-cream-deep/60 p-10 text-center">
          <PackageOpen size={32} className="mx-auto text-foreground/30" />
          <p className="mt-4 text-foreground/60">
            Ainda não fizeste nenhuma encomenda.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
          >
            Explorar catálogo
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/loja/encomendas/${order.id}`}
              className="flex items-center justify-between gap-4 py-4 hover:bg-cream-deep/40"
            >
              <div>
                <p className="text-sm font-semibold text-ink">
                  Encomenda #{order.id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-0.5 text-xs text-foreground/55">
                  {order.items.length} artigo(s) ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-brand">
                  {formatMoney(Number(order.totalAmount), order.currency)}
                </p>
                <p className="mt-0.5 text-xs text-foreground/55">
                  {STATUS_LABEL[order.status] ?? order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
