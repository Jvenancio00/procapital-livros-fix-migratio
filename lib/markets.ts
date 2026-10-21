import type { Currency, MarketCode } from "@/lib/enums";

export interface MarketDefinition {
  code: MarketCode;
  name: string;
  shortName: string;
  currency: Currency;
  isoCurrency: string;
  flagLabel: string;
  capitalHub: string;
  taxIdLabel: string;
  defaultTaxRatePercent: number;
  defaultShippingFlatFee: number;
  defaultFreeShippingThreshold: number;
  estimatedDeliveryDays: string;
  shippingSummary?: string;
  defaultBankDetails: string;
  localMethodName: string;
}

export const MARKETS: Record<MarketCode, MarketDefinition> = {
  AO: {
    code: "AO",
    name: "Angola",
    shortName: "Angola",
    currency: "KZ",
    isoCurrency: "AOA",
    flagLabel: "AO",
    capitalHub: "Luanda",
    taxIdLabel: "NIF",
    defaultTaxRatePercent: 14,
    defaultShippingFlatFee: 2500,
    defaultFreeShippingThreshold: 35000,
    estimatedDeliveryDays: "2 a 5 dias úteis em Luanda · 5 a 10 dias nas províncias",
    shippingSummary: "Expedição Luanda (2–5 dias úteis) e províncias · Portes grátis acima de 35.000 Kz",
    defaultBankDetails:
      "Transferência Bancária em AOA (IBAN empresarial Angola indicado na nota de encomenda após confirmação) — envio de comprovativo com o número da encomenda.",
    localMethodName: "Transferência Bancária AOA / Multicaixa Empresarial",
  },
  MZ: {
    code: "MZ",
    name: "Moçambique",
    shortName: "Moçambique",
    currency: "MT",
    isoCurrency: "MZN",
    flagLabel: "MZ",
    capitalHub: "Maputo",
    taxIdLabel: "NUIT",
    defaultTaxRatePercent: 0, // Livros escolares e culturais isentos/regime aplicável configurável
    defaultShippingFlatFee: 250,
    defaultFreeShippingThreshold: 3500,
    estimatedDeliveryDays: "Até 24h–48h em Maputo e Matola · 3 a 7 dias nas províncias",
    shippingSummary: "Entrega 24h–48h em Maputo/Matola e 3–7 dias nas províncias · Portes grátis acima de 3.500 MT",
    defaultBankDetails:
      "Pro Capital, Lda · NUIT 401430857 · Sede: Rua Almeida Garrett n.º 366, Bairro da Coop, Maputo · Pagamento por Transferência Bancária em MZN (comercial@procapitalmz.com).",
    localMethodName: "M-Pesa / e-Mola Empresarial",
  },
  PT: {
    code: "PT",
    name: "Portugal",
    shortName: "Portugal",
    currency: "EUR",
    flagLabel: "PT",
    isoCurrency: "EUR",
    capitalHub: "Lisboa",
    taxIdLabel: "NIF / NIPC",
    defaultTaxRatePercent: 6, // Taxa reduzida aplicável a livros em Portugal
    defaultShippingFlatFee: 4.9,
    defaultFreeShippingThreshold: 45,
    estimatedDeliveryDays: "2 a 4 dias úteis em Portugal Continental",
    shippingSummary: "Entrega 2–4 dias úteis em Portugal Continental · Portes grátis acima de 45 €",
    defaultBankDetails:
      "Transferência SEPA em EUR — referência comercial indicada na confirmação da encomenda.",
    localMethodName: "Cartão / MB WAY (via gateway verificado)",
  },
  BR: {
    code: "BR",
    name: "Brasil",
    shortName: "Brasil",
    currency: "BRL",
    isoCurrency: "BRL",
    flagLabel: "BR",
    capitalHub: "São Paulo",
    taxIdLabel: "CPF / CNPJ",
    defaultTaxRatePercent: 0, // Imunidade tributária constitucional de livros no Brasil
    defaultShippingFlatFee: 19.9,
    defaultFreeShippingThreshold: 199,
    estimatedDeliveryDays: "3 a 8 dias úteis nas capitais brasileiras",
    shippingSummary: "Entrega 3–8 dias úteis nas capitais · Portes grátis acima de R$ 199",
    defaultBankDetails:
      "Transferência Bancária / Pix Empresarial em BRL — referência comercial indicada na encomenda.",
    localMethodName: "Pix / Cartão (via gateway verificado)",
  },
};

export const MARKET_LIST: MarketDefinition[] = [
  MARKETS.AO,
  MARKETS.MZ,
  MARKETS.PT,
  MARKETS.BR,
];

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente de análise",
  IN_REVIEW: "Em análise comercial",
  QUOTED: "Proposta enviada",
  APPROVED: "Aprovada pelo cliente",
  CONVERTED_ORDER: "Convertida em encomenda",
  REJECTED: "Encerrada / Recusada",
};

export function currencyForMarket(market: MarketCode): Currency {
  return MARKETS[market].currency;
}

export function marketForCurrency(currency: Currency): MarketCode {
  switch (currency) {
    case "KZ":
      return "AO";
    case "MT":
      return "MZ";
    case "EUR":
      return "PT";
    case "BRL":
      return "BR";
  }
}

export function resolveCountryInput(raw: string | null | undefined): MarketCode | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === "ao" || v === "ago" || v.includes("angola") || v === "kz" || v === "aoa") return "AO";
  if (v === "mz" || v === "moz" || v.includes("moçambique") || v.includes("mocambique") || v === "mt" || v === "mzn") return "MZ";
  if (v === "pt" || v === "prt" || v.includes("portugal") || v === "eur") return "PT";
  if (v === "br" || v === "bra" || v.includes("brasil") || v.includes("brazil") || v === "brl") return "BR";
  return null;
}

export const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  ENSINO_PRIMARIO: "Ensino Primário",
  ENSINO_SECUNDARIO: "Ensino Secundário",
  TECNICO_PROFISSIONAL: "Ensino Técnico-Profissional",
  ENSINO_SUPERIOR: "Ensino Superior",
  GERAL: "Literatura & Geral",
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  PARTICULAR: "Leitor particular",
  LIVRARIA: "Livraria",
  REVENDEDOR: "Revendedor livreiro",
  ESCOLA: "Escola ou colégio",
  UNIVERSIDADE: "Universidade ou instituto superior",
  EDITORA: "Editora parceira",
  EMPRESA_INSTITUICAO: "Empresa ou instituição",
  DISTRIBUIDOR_PARCEIRO: "Distribuidor ou parceiro comercial",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING: "Pendente",
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Paga",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Por liquidar",
  PENDING_TRANSFER: "Aguardando comprovativo",
  UNDER_REVIEW: "Em validação administrativa",
  CONFIRMED: "Pagamento confirmado",
  FAILED: "Falhado / Rejeitado",
  REFUNDED: "Reembolsado",
};
