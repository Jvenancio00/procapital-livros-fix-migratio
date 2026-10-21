import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog, requireAdminApi } from "@/lib/admin-auth";
import { MarketCode } from "@/lib/enums";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const markets = await prisma.marketConfig.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json({
    markets,
    gatewayEnvStatus: {
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
      mpesaConfigured: Boolean(process.env.MPESA_API_KEY?.trim()),
      webhookSecretConfigured: Boolean(
        process.env.PAYMENT_WEBHOOK_HMAC_SECRET?.trim() ||
          process.env.STRIPE_WEBHOOK_SECRET?.trim()
      ),
    },
  });
}

export async function PATCH(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const body = await request.json().catch(() => null);
  const code = body?.code as MarketCode;
  if (!(Object.values(MarketCode) as string[]).includes(code)) {
    return NextResponse.json({ error: "Código de mercado inválido." }, { status: 400 });
  }

  const updated = await prisma.marketConfig.update({
    where: { code },
    data: {
      ...(body.taxRatePercent !== undefined
        ? { taxRatePercent: Number(body.taxRatePercent) || 0 }
        : {}),
      ...(body.shippingFlatFee !== undefined
        ? { shippingFlatFee: Number(body.shippingFlatFee) || 0 }
        : {}),
      ...(body.freeShippingThreshold !== undefined
        ? {
            freeShippingThreshold:
              body.freeShippingThreshold === "" || body.freeShippingThreshold === null
                ? null
                : Number(body.freeShippingThreshold),
          }
        : {}),
      ...(body.estimatedDeliveryDays !== undefined
        ? { estimatedDeliveryDays: String(body.estimatedDeliveryDays).trim() }
        : {}),
      ...(body.bankTransferEnabled !== undefined
        ? { bankTransferEnabled: Boolean(body.bankTransferEnabled) }
        : {}),
      ...(body.bankAccountDetails !== undefined
        ? { bankAccountDetails: String(body.bankAccountDetails).trim() || null }
        : {}),
      ...(body.localMethodName !== undefined
        ? { localMethodName: String(body.localMethodName).trim() || null }
        : {}),
      ...(body.localMethodEnabled !== undefined
        ? { localMethodEnabled: Boolean(body.localMethodEnabled) }
        : {}),
      ...(body.cardGatewayEnabled !== undefined
        ? { cardGatewayEnabled: Boolean(body.cardGatewayEnabled) }
        : {}),
      ...(body.quoteEnabled !== undefined
        ? { quoteEnabled: Boolean(body.quoteEnabled) }
        : {}),
      ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
    },
  });

  await recordAuditLog({
    action: "MARKET_CONFIG_UPDATED",
    entityType: "MarketConfig",
    entityId: code,
    actorId: guard.actor.id,
    actorEmail: guard.actor.email,
    details: {
      code,
      taxRatePercent: Number(updated.taxRatePercent),
      shippingFlatFee: Number(updated.shippingFlatFee),
      active: updated.active,
    },
  });

  return NextResponse.json({ ok: true, market: updated });
}
