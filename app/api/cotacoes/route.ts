import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedActor } from "@/lib/admin-auth";
import { isValidEmailAddress, sendTransactionalEmail } from "@/lib/email";
import { ClientType, Currency, MarketCode } from "@/lib/enums";
import { currencyForMarket, MARKETS } from "@/lib/markets";

export async function GET() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  }

  const quotes = await prisma.quoteRequest.findMany({
    where: {
      OR: [{ userId: actor.id }, { email: actor.email }],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const contactName = String(body.contactName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = body.phone ? String(body.phone).trim() : null;
  const organizationName = body.organizationName
    ? String(body.organizationName).trim()
    : null;
  const taxId = body.taxId ? String(body.taxId).trim() : null;
  const clientType = (Object.values(ClientType) as string[]).includes(body.clientType)
    ? (body.clientType as ClientType)
    : "ESCOLA";
  const countryCode = (Object.values(MarketCode) as string[]).includes(body.countryCode)
    ? (body.countryCode as MarketCode)
    : "MZ";
  const currency = (Object.values(Currency) as string[]).includes(body.currency)
    ? (body.currency as Currency)
    : currencyForMarket(countryCode);
  const academicYear = body.academicYear ? Number(body.academicYear) : null;
  const deliveryAddress = body.deliveryAddress
    ? String(body.deliveryAddress).trim()
    : null;
  const notes = body.notes ? String(body.notes).trim() : null;
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (!contactName || !isValidEmailAddress(email)) {
    return NextResponse.json(
      { error: "Indique o nome de contacto e um endereço de email válido." },
      { status: 400 }
    );
  }
  if (rawItems.length === 0) {
    return NextResponse.json(
      { error: "Adicione pelo menos um título ou manual ao pedido de cotação." },
      { status: 400 }
    );
  }

  const actor = await getAuthenticatedActor();

  const slugs = rawItems
    .map((i: { slug?: string }) => i.slug)
    .filter((s: unknown): s is string => typeof s === "string" && s.length > 0);
  const dbBooks = slugs.length
    ? await prisma.book.findMany({
        where: { slug: { in: slugs } },
        include: { prices: { where: { currency } } },
      })
    : [];
  const bookBySlug = new Map(dbBooks.map((b) => [b.slug, b]));

  let estimatedTotal = 0;
  const itemsToCreate = rawItems.map(
    (item: {
      slug?: string;
      title?: string;
      isbn?: string;
      publisher?: string;
      quantity?: number;
      notes?: string;
    }) => {
      const qty = Math.max(1, Math.min(50000, Math.floor(Number(item.quantity) || 1)));
      const matched = item.slug ? bookBySlug.get(item.slug) : undefined;
      const unitRef = matched?.prices[0] ? Number(matched.prices[0].amount) : null;
      if (unitRef) estimatedTotal += unitRef * qty;

      return {
        bookId: matched?.id ?? null,
        bookSlug: matched?.slug ?? item.slug ?? null,
        bookTitle: matched?.title ?? String(item.title ?? "Título solicitado").trim(),
        isbn: matched?.isbn ?? (item.isbn ? String(item.isbn).trim() : null),
        publisher:
          matched?.editora ?? (item.publisher ? String(item.publisher).trim() : null),
        quantity: qty,
        unitPriceQuoted: unitRef,
        notes: item.notes ? String(item.notes).trim() : null,
      };
    }
  );

  const quoteNumber = `COT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const created = await prisma.quoteRequest.create({
    data: {
      quoteNumber,
      status: "PENDING",
      contactName,
      email,
      phone,
      organizationName,
      taxId,
      clientType,
      countryCode,
      currency,
      academicYear: academicYear && Number.isInteger(academicYear) ? academicYear : null,
      deliveryAddress,
      notes,
      estimatedTotal: estimatedTotal > 0 ? estimatedTotal : null,
      userId: actor?.id ?? null,
      items: {
        create: itemsToCreate,
      },
    },
    include: { items: true },
  });

  const emailResult = await sendTransactionalEmail({
    template: "QUOTE_REQUEST",
    to: email,
    data: {
      quoteNumber: created.quoteNumber,
      contactName,
      organizationName: organizationName ?? CLIENT_NAME_FALLBACK(clientType),
      marketName: MARKETS[countryCode].name,
      itemCount: created.items.length,
    },
  });

  return NextResponse.json({
    id: created.id,
    quoteNumber: created.quoteNumber,
    status: created.status,
    estimatedTotal: created.estimatedTotal ? Number(created.estimatedTotal) : null,
    emailNotification: emailResult,
  });
}

function CLIENT_NAME_FALLBACK(type: ClientType): string {
  switch (type) {
    case "ESCOLA":
      return "Instituição de Ensino";
    case "LIVRARIA":
      return "Livraria Parceira";
    default:
      return "Cliente Comercial";
  }
}
