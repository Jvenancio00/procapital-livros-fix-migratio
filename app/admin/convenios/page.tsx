import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ConveniosAdminTable from "./ConveniosAdminTable";

// Painel administrativo simples para os pedidos de convénio — corrige
// "Não existe área exclusiva" / "Falta painel administrativo".
// Não é um CRM (HubSpot/Salesforce) — isso continua por integrar — mas já
// dá visibilidade e controlo mínimo à equipa comercial sem SQL manual.
export default async function ConveniosAdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    redirect("/loja/entrar?callbackUrl=%2Fadmin%2Fconvenios");
  }

  const pedidos = await prisma.convenioPedido.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink">Pedidos de convénio</h1>
      <p className="mt-2 text-sm text-foreground/60">
        {pedidos.length} pedido(s) recebidos através do formulário público.
      </p>
      <ConveniosAdminTable pedidos={JSON.parse(JSON.stringify(pedidos))} />
    </div>
  );
}
