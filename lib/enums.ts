/**
 * Enums e tipos de domínio sincronizados 1:1 com `prisma/schema.prisma`.
 */

export const Role = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Currency = {
  KZ: "KZ",
  MT: "MT",
  EUR: "EUR",
  BRL: "BRL",
} as const;
export type Currency = (typeof Currency)[keyof typeof Currency];

export const MarketCode = {
  AO: "AO",
  MZ: "MZ",
  PT: "PT",
  BR: "BR",
} as const;
export type MarketCode = (typeof MarketCode)[keyof typeof MarketCode];

export const EducationLevel = {
  ENSINO_PRIMARIO: "ENSINO_PRIMARIO",
  ENSINO_SECUNDARIO: "ENSINO_SECUNDARIO",
  TECNICO_PROFISSIONAL: "TECNICO_PROFISSIONAL",
  ENSINO_SUPERIOR: "ENSINO_SUPERIOR",
  GERAL: "GERAL",
} as const;
export type EducationLevel = (typeof EducationLevel)[keyof typeof EducationLevel];
export type EducationLevelCode = EducationLevel;

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  ENSINO_PRIMARIO: "Ensino Primário",
  ENSINO_SECUNDARIO: "Ensino Secundário",
  TECNICO_PROFISSIONAL: "Técnico-Profissional",
  ENSINO_SUPERIOR: "Ensino Superior & Académico",
  GERAL: "Geral / Extracurricular",
};

export const OrderStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  UNPAID: "UNPAID",
  PENDING_TRANSFER: "PENDING_TRANSFER",
  UNDER_REVIEW: "UNDER_REVIEW",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const StockMovementType = {
  INITIAL_SEED: "INITIAL_SEED",
  IMPORT_IN: "IMPORT_IN",
  MANUAL_ADJUSTMENT: "MANUAL_ADJUSTMENT",
  CHECKOUT_RESERVE: "CHECKOUT_RESERVE",
  RESERVATION_RELEASE: "RESERVATION_RELEASE",
  SALE_CONFIRMED: "SALE_CONFIRMED",
  ORDER_REFUND: "ORDER_REFUND",
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export const ReservationStatus = {
  ACTIVE: "ACTIVE",
  COMMITTED: "COMMITTED",
  RELEASED: "RELEASED",
  EXPIRED: "EXPIRED",
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const ImportMode = {
  UPDATE_STOCK: "UPDATE_STOCK",
  UPDATE_PRICES: "UPDATE_PRICES",
  IMPORT_BOOKS: "IMPORT_BOOKS",
  COMBINED: "COMBINED",
} as const;
export type ImportMode = (typeof ImportMode)[keyof typeof ImportMode];

export const QuoteStatus = {
  PENDING: "PENDING",
  IN_REVIEW: "IN_REVIEW",
  QUOTED: "QUOTED",
  APPROVED: "APPROVED",
  CONVERTED_ORDER: "CONVERTED_ORDER",
  REJECTED: "REJECTED",
} as const;
export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const NoteKind = {
  BOOKMARK: "BOOKMARK",
  NOTE: "NOTE",
} as const;
export type NoteKind = (typeof NoteKind)[keyof typeof NoteKind];

export const TipoInstituicao = {
  ESCOLA: "ESCOLA",
  UNIVERSIDADE: "UNIVERSIDADE",
  LIVRARIA: "LIVRARIA",
  EDITORA: "EDITORA",
  OUTRO: "OUTRO",
} as const;
export type TipoInstituicao = (typeof TipoInstituicao)[keyof typeof TipoInstituicao];

export const EstadoConvenio = {
  PENDENTE: "PENDENTE",
  EM_ANALISE: "EM_ANALISE",
  APROVADO: "APROVADO",
  REJEITADO: "REJEITADO",
} as const;
export type EstadoConvenio = (typeof EstadoConvenio)[keyof typeof EstadoConvenio];

export const TipoEvento = {
  LANCAMENTO: "LANCAMENTO",
  FEIRA: "FEIRA",
  WORKSHOP: "WORKSHOP",
  OUTRO: "OUTRO",
} as const;
export type TipoEvento = (typeof TipoEvento)[keyof typeof TipoEvento];

export const EstadoInscricao = {
  CONFIRMADA: "CONFIRMADA",
  LISTA_ESPERA: "LISTA_ESPERA",
  CANCELADA: "CANCELADA",
} as const;
export type EstadoInscricao = (typeof EstadoInscricao)[keyof typeof EstadoInscricao];

export const ClientType = {
  PARTICULAR: "PARTICULAR",
  LIVRARIA: "LIVRARIA",
  REVENDEDOR: "REVENDEDOR",
  ESCOLA: "ESCOLA",
  UNIVERSIDADE: "UNIVERSIDADE",
  EDITORA: "EDITORA",
  EMPRESA_INSTITUICAO: "EMPRESA_INSTITUICAO",
  DISTRIBUIDOR_PARCEIRO: "DISTRIBUIDOR_PARCEIRO",
} as const;
export type ClientType = (typeof ClientType)[keyof typeof ClientType];

export const ContactReason = {
  PUBLICAR: "PUBLICAR",
  COMPRAR: "COMPRAR",
  PARCERIA: "PARCERIA",
  SUPORTE_TECNICO: "SUPORTE_TECNICO",
  COMERCIAL: "COMERCIAL",
  OUTRO: "OUTRO",
  EDITORA: "EDITORA",
  LIVRARIA: "LIVRARIA",
  ESCOLA: "ESCOLA",
  PARCEIRO_COMERCIAL: "PARCEIRO_COMERCIAL",
  INVESTIMENTO: "INVESTIMENTO",
  LEITOR: "LEITOR",
} as const;
export type ContactReason = (typeof ContactReason)[keyof typeof ContactReason];
