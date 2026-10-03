import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";

export default async function EncomendaConfirmadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/loja/entrar?callbackUrl=/loja/encomendas/${id}`);
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { book: true } }, user: true },
  });

  if (!order || order.user.email !== session.user.email) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-center">
        <CheckCircle2 size={40} className="mx-auto text-brand" />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Encomenda registada
        </h1>
        <p className="mt-3 text-foreground/70">
          Obrigado! A sua encomenda #{order.id.slice(-8).toUpperCase()} foi
          recebida e está pendente de confirmação de pagamento. Entraremos em
          contacto com os detalhes de pagamento e entrega.
        </p>
      </div>

      <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-cream-deep/60 p-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-3 text-sm">
            <span className="text-ink">
              {item.quantity}× {item.book.title}
            </span>
            <span className="font-medium text-ink">
              {formatMoney(Number(item.unitPrice) * item.quantity, order.currency)}
            </span>
          </div>
        ))}
        <div className="flex justify-between pt-4 font-serif text-base font-semibold text-ink">
          <span>Total</span>
          <span>{formatMoney(Number(order.totalAmount), order.currency)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
        >
          Continuar a explorar
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
