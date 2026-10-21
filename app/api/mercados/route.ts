import { NextResponse } from "next/server";
import { getActiveMarketConfigs } from "@/lib/catalog";
import { getAvailablePaymentMethodsForMarket } from "@/lib/payments";
import type { ClientType, MarketCode } from "@/lib/enums";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientType = (searchParams.get("clientType") ?? "PARTICULAR") as ClientType;

  const markets = await getActiveMarketConfigs();
  const enriched = markets.map((m) => ({
    ...m,
    paymentMethods: getAvailablePaymentMethodsForMarket({
      market: m.code as MarketCode,
      currency: m.currency,
      clientType,
      bankTransferEnabled: m.bankTransferEnabled,
      bankAccountDetails: m.bankAccountDetails,
    }),
  }));

  return NextResponse.json({ markets: enriched });
}
