import crypto from "node:crypto";
import type { ClientType, Currency, MarketCode } from "@/lib/enums";
import { MARKETS } from "@/lib/markets";

export interface AvailablePaymentMethod {
  id: string;
  label: string;
  description: string;
  provider: "bank_transfer" | "quote_invoice" | "stripe" | "mpesa";
  requiresAdminVerification: boolean;
  instantConfirmation: boolean;
  instructions?: string;
}

/**
 * Devolve apenas métodos de pagamento efetivamente disponíveis e honestos para
 * o país, moeda e perfil de comprador selecionados.
 * - Gateways automáticos (Stripe / M-Pesa) só aparecem se as credenciais reais
 *   estiverem definidas no servidor.
 * - Caso contrário, disponibiliza Transferência Bancária com validação
 *   administrativa e Pedido de Faturação / Cotação B2B — nunca pagamentos simulados.
 */
export function getAvailablePaymentMethodsForMarket(params: {
  market: MarketCode;
  currency: Currency;
  clientType: ClientType;
  bankTransferEnabled?: boolean;
  bankAccountDetails?: string | null;
}): AvailablePaymentMethod[] {
  const methods: AvailablePaymentMethod[] = [];
  const marketDef = MARKETS[params.market];
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const hasMpesa = Boolean(process.env.MPESA_API_KEY?.trim());

  if (params.bankTransferEnabled !== false) {
    const labelByMarket: Record<MarketCode, string> = {
      AO: "Transferência Bancária Empresarial (AOA / Kz)",
      MZ: "Transferência Bancária Pro Capital (MZN / MT)",
      PT: "Transferência Bancária SEPA (EUR)",
      BR: "Transferência Bancária / Pix Empresarial (BRL)",
    };
    methods.push({
      id: `BANK_TRANSFER_${params.market}`,
      label: labelByMarket[params.market],
      description:
        "Encomenda reservada de imediato; confirmação após validação do comprovativo pela equipa financeira da Pro Capital.",
      provider: "bank_transfer",
      requiresAdminVerification: true,
      instantConfirmation: false,
      instructions: params.bankAccountDetails || marketDef.defaultBankDetails,
    });
  }

  if (params.market === "MZ" && hasMpesa) {
    methods.push({
      id: "MPESA_MZ",
      label: "M-Pesa Empresarial (MZN)",
      description: "Confirmação automática via notificação verificada do operador.",
      provider: "mpesa",
      requiresAdminVerification: false,
      instantConfirmation: true,
    });
  }

  if ((params.market === "PT" || params.market === "BR") && hasStripe) {
    methods.push({
      id: params.market === "BR" ? "STRIPE_PIX_CARD_BR" : "STRIPE_CARD_SEPA_PT",
      label:
        params.market === "BR"
          ? "Cartão ou Pix (Gateway Verificado BRL)"
          : "Cartão ou Multibanco/SEPA (Gateway Verificado EUR)",
      description:
        "Processado externamente pelo fornecedor certificado PCI-DSS (dados de cartão nunca passam pela base de dados da Pro Capital).",
      provider: "stripe",
      requiresAdminVerification: false,
      instantConfirmation: true,
    });
  }

  if (params.clientType !== "PARTICULAR") {
    methods.push({
      id: `B2B_INVOICE_${params.market}`,
      label: "Faturação Institucional / Proforma B2B",
      description:
        "Emissão de fatura proforma com validação administrativa de condições comerciais para escolas, livrarias e instituições.",
      provider: "quote_invoice",
      requiresAdminVerification: true,
      instantConfirmation: false,
      instructions:
        "A nossa equipa comercial envia a fatura proforma validada e coordena a expedição conforme o acordo institucional.",
    });
  }

  return methods;
}

/**
 * Valida a assinatura HMAC-SHA256 de um webhook de pagamento com comparação em
 * tempo constante (`crypto.timingSafeEqual`).
 */
export function verifyPaymentWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  explicitSecret?: string,
): boolean {
  const secret =
    explicitSecret?.trim() ||
    process.env.PAYMENT_WEBHOOK_HMAC_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !signatureHeader) return false;

  const cleanSig = signatureHeader.replace(/^sha256=/i, "").trim();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  if (cleanSig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cleanSig, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}
