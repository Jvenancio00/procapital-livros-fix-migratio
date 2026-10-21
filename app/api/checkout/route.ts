import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, type Currency } from "@/lib/currency";
import { quantityDiscountRate } from "@/lib/cart-pricing";
import { ClientType, MarketCode } from "@/lib/enums";
import {
  marketForCurrency,
  MARKETS,
  ORDER_STATUS_LABELS,
} from "@/lib/markets";
import {
  releaseExpiredReservations,
  reserveOrderStockInTx,
} from "@/lib/stock";
import { getAvailablePaymentMethodsForMarket } from "@/lib/payments";
import { sendTransactionalEmail } from "@/lib/email";

const VALID_CURRENCIES: Currency[] = ["KZ", "MT", "EUR", "BRL"];
const MAX_QUANTITY_PER_ITEM = 5000;

interface CheckoutItem {
  slug: string;
  quantity: number;
}

export async function POST(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email?.trim().toLowerCase();
  if (!userEmail) {
    return NextResponse.json(
      { error: "É necessário iniciar sessão para finalizar a encomenda." },
      { status: 401 }
    );
  }

  // Liberta eventuais reservas expiradas antes de validar disponibilidade
  await releaseExpiredReservations().catch(() => {});

  const body = await request.json().catch(() => null);
  const items: CheckoutItem[] = body?.items;
  const currency: Currency = body?.currency;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }
  if (!VALID_CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: "Moeda comercial inválida." }, { status: 400 });
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

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { clientProfile: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  const requestedMarket = (Object.values(MarketCode) as string[]).includes(
    body?.countryCode
  )
    ? (body.countryCode as MarketCode)
    : marketForCurrency(currency);

  const marketConfig = await prisma.marketConfig.findUnique({
    where: { code: requestedMarket },
  });

  const clientType: ClientType =
    body?.clientType && (Object.values(ClientType) as string[]).includes(body.clientType)
      ? (body.clientType as ClientType)
      : (user.clientProfile?.type ?? "PARTICULAR");

  const availableMethods = getAvailablePaymentMethodsForMarket({
    market: requestedMarket,
    currency,
    clientType,
    bankTransferEnabled: marketConfig?.bankTransferEnabled ?? true,
    bankAccountDetails: marketConfig?.bankAccountDetails ?? MARKETS[requestedMarket].defaultBankDetails,
  });

  const chosenMethod =
    availableMethods.find((m) => m.id === body?.paymentMethod) ?? availableMethods[0];
  if (!chosenMethod) {
    return NextResponse.json(
      { error: "Nenhum método de pagamento disponível para este mercado." },
      { status: 400 }
    );
  }

  const books = await prisma.book.findMany({
    where: { slug: { in: items.map((i) => i.slug) }, active: true },
    include: {
      prices: { where: { currency } },
      editoraRef: { select: { name: true } },
    },
  });
  const bookBySlug = new Map(books.map((b) => [b.slug, b]));

  // Desconto administrativo B2B autorizado na base de dados (nunca aceite do cliente)
  const adminApprovedDiscount =
    user.clientProfile?.approvedB2B && (user.clientProfile.discountPercent ?? 0) > 0
      ? user.clientProfile.discountPercent / 100
      : 0;

  let subtotalAmount = 0;
  let discountAmount = 0;

  const preparedItems: {
    bookId: string;
    title: string;
    isbn: string | null;
    publisher: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    allowPreorder: boolean;
  }[] = [];

  for (const item of items) {
    const book = bookBySlug.get(item.slug);
    const priceRow = book?.prices[0];
    if (!book || (!book.free && (!priceRow || !priceRow.marketActive || Number(priceRow.amount) <= 0))) {
      return NextResponse.json(
        {
          error: `O título "${item.slug}" não tem preço comercial ativo para ${MARKETS[requestedMarket].name} (${currency}). Solicite cotação comercial.`,
        },
        { status: 400 }
      );
    }

    const rawUnit = book.free ? 0 : Number(priceRow!.amount);
    const qtyRate = quantityDiscountRate(item.quantity);
    const effectiveDiscountRate = Math.max(adminApprovedDiscount, qtyRate);
    const lineGross = rawUnit * item.quantity;
    const lineDiscount = lineGross * effectiveDiscountRate;

    subtotalAmount += lineGross;
    discountAmount += lineDiscount;

    preparedItems.push({
      bookId: book.id,
      title: book.title,
      isbn: book.isbn,
      publisher: book.editoraRef?.name ?? book.editora,
      quantity: item.quantity,
      unitPrice: Number((rawUnit * (1 - effectiveDiscountRate)).toFixed(2)),
      discountPercent: Math.round(effectiveDiscountRate * 100),
      allowPreorder: book.allowPreorder,
    });
  }

  const netBeforeTax = Math.max(0, subtotalAmount - discountAmount);
  const taxRate = Number(
    marketConfig?.taxRatePercent ?? MARKETS[requestedMarket].defaultTaxRatePercent
  );
  const freeShipThreshold =
    marketConfig?.freeShippingThreshold != null
      ? Number(marketConfig.freeShippingThreshold)
      : MARKETS[requestedMarket].defaultFreeShippingThreshold;
  const flatShipping = Number(
    marketConfig?.shippingFlatFee ?? MARKETS[requestedMarket].defaultShippingFlatFee
  );

  const needsPhysicalShipping = body?.deliveryMode !== "DIGITAL_ONLY";
  const shippingAmount =
    !needsPhysicalShipping || netBeforeTax === 0 || netBeforeTax >= freeShipThreshold
      ? 0
      : flatShipping;
  const taxAmount = Number(((netBeforeTax * taxRate) / 100).toFixed(2));
  const totalAmount = Number((netBeforeTax + taxAmount + shippingAmount).toFixed(2));

  const orderNumber = `PC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const buyerName = String(body?.buyerName ?? user.name ?? user.email).trim();
  const buyerPhone = body?.buyerPhone ? String(body.buyerPhone).trim() : null;
  const buyerTaxId = body?.buyerTaxId
    ? String(body.buyerTaxId).trim()
    : (user.clientProfile?.taxId ?? null);
  const companyName = body?.companyName
    ? String(body.companyName).trim()
    : (user.clientProfile?.companyName ?? null);
  const shippingAddress = body?.shippingAddress
    ? String(body.shippingAddress).trim()
    : (user.clientProfile?.billingAddress ?? null);
  const shippingCity = body?.shippingCity
    ? String(body.shippingCity).trim()
    : (user.clientProfile?.city ?? MARKETS[requestedMarket].capitalHub);
  const shippingPostalCode = body?.shippingPostalCode
    ? String(body.shippingPostalCode).trim()
    : null;
  const invoiceRequested = Boolean(body?.invoiceRequested || clientType !== "PARTICULAR");
  const notes = body?.notes ? String(body.notes).trim() : null;

  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          currency,
          countryCode: requestedMarket,
          status: totalAmount === 0 ? "PAID" : "AWAITING_PAYMENT",
          paymentStatus: totalAmount === 0 ? "CONFIRMED" : "PENDING_TRANSFER",
          paymentMethod: chosenMethod.label,
          buyerName,
          buyerEmail: user.email,
          buyerPhone,
          buyerTaxId,
          companyName,
          clientType,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          subtotalAmount,
          discountAmount,
          taxAmount,
          shippingAmount,
          totalAmount,
          invoiceRequested,
          notes,
          items: {
            create: preparedItems.map((p) => ({
              bookId: p.bookId,
              quantity: p.quantity,
              unitPrice: p.unitPrice,
              titleSnapshot: p.title,
              isbnSnapshot: p.isbn,
              publisherSnapshot: p.publisher,
              currencySnapshot: currency,
              discountPercent: p.discountPercent,
            })),
          },
        },
      });

      const { expiresAt } = await reserveOrderStockInTx(tx, {
        orderId: order.id,
        orderNumber,
        countryCode: requestedMarket,
        items: preparedItems.map((p) => ({
          bookId: p.bookId,
          title: p.title,
          quantity: p.quantity,
          allowPreorder: p.allowPreorder,
        })),
        actorEmail: user.email,
      });

      await tx.order.update({
        where: { id: order.id },
        data: { reservationExpiresAt: expiresAt },
      });

      await tx.paymentRecord.create({
        data: {
          orderId: order.id,
          provider: chosenMethod.provider,
          method: chosenMethod.label,
          amount: totalAmount,
          currency,
          status: totalAmount === 0 ? "CONFIRMED" : "PENDING_TRANSFER",
          notes: chosenMethod.instructions ?? null,
        },
      });

      return { ...order, reservationExpiresAt: expiresAt };
    });

    const emailNotification = await sendTransactionalEmail({
      template: "ORDER_CONFIRMATION",
      to: user.email,
      data: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber ?? createdOrder.id,
        buyerName,
        marketName: MARKETS[requestedMarket].name,
        statusLabel: ORDER_STATUS_LABELS[createdOrder.status] ?? createdOrder.status,
        totalFormatted: formatMoney(totalAmount, currency),
        paymentMethod: chosenMethod.label,
        paymentInstructions: chosenMethod.instructions,
      },
    });

    return NextResponse.json({
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      status: createdOrder.status,
      totalAmount,
      currency,
      reservationExpiresAt: createdOrder.reservationExpiresAt,
      paymentInstructions: chosenMethod.instructions,
      emailNotification,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível reservar stock e concluir a encomenda.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
