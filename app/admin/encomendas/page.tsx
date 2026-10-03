import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EncomendasAdminTable from "./EncomendasAdminTable";

export default async function EncomendasAdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    redirect("/loja/entrar?callbackUrl=%2Fadmin%2Fencomendas");
  }

  const encomendas = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: { include: { book: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink">Encomendas</h1>
      <p className="mt-2 text-sm text-foreground/60">
        {encomendas.length} encomenda(s) da loja digital.
      </p>
      <EncomendasAdminTable encomendas={JSON.parse(JSON.stringify(encomendas))} />
    </div>
  );
}
