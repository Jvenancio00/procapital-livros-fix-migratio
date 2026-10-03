import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Currency } from "@/lib/currency";

const VALID_CURRENCIES: Currency[] = ["KZ", "MT", "EUR", "BRL"];
const MAX_QUANTITY_PER_ITEM = 50;

interface CheckoutItem {
  slug: string;
  quantity: number;
}

// Cria uma encomenda real a partir do carrinho da loja digital. Os preços
// nunca são aceites do cliente — são sempre lidos da base de dados, para
// que ninguém consiga alterar o preço de um livro a partir do browser.
export async function POST(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json(
      { error: "É necessário iniciar sessão para finalizar a compra." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const items: CheckoutItem[] = body?.items;
  const currency: Currency = body?.currency;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }
  if (!VALID_CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: "Moeda inválida." }, { status: 400 });
  }
  for (const item of items) {
    if (
      typeof item.slug !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY_PER_ITEM
    ) {
      return NextResponse.json({ error: "Item de carrinho inválido." }, { status: 400 });
    }
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  const books = await prisma.book.findMany({
    where: { slug: { in: items.map((i) => i.slug) } },
    include: { prices: { where: { currency } } },
  });
  const bookBySlug = new Map(books.map((b) => [b.slug, b]));

  const orderItemsData: { bookId: string; quantity: number; unitPrice: number }[] = [];
  for (const item of items) {
    const book = bookBySlug.get(item.slug);
    const price = book?.prices[0];
    if (!book || !price) {
      return NextResponse.json(
        { error: `Livro "${item.slug}" não disponível para compra.` },
        { status: 400 }
      );
    }
    orderItemsData.push({
      bookId: book.id,
      quantity: item.quantity,
      unitPrice: Number(price.amount),
    });
  }

  const totalAmount = orderItemsData.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      currency,
      totalAmount,
      status: "PENDING",
      items: { create: orderItemsData },
    },
  });

  return NextResponse.json({ id: order.id });
}
