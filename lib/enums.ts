/**
 * Enums e tipos de domínio espelhados de `prisma/schema.prisma`.
 *
 * Porquê: `@prisma/client` só exporta enums depois de um `prisma generate`
 * bem-sucedido. Em ambientes sem acesso a `binaries.prisma.sh` (sandboxes,
 * CI offline) o client fica como placeholder e todos os `import { Role }
 * from "@prisma/client"` rebentam a compilação de TypeScript.
 *
 * Estes objetos são a única fonte de verdade para o código da aplicação e
 * têm exatamente os mesmos valores do schema — validá-los aqui é seguro,
 * porque o Postgres rejeitaria qualquer valor divergente na escrita.
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

export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

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
export type TipoInstituicao =
  (typeof TipoInstituicao)[keyof typeof TipoInstituicao];

export const EstadoConvenio = {
  PENDENTE: "PENDENTE",
  EM_ANALISE: "EM_ANALISE",
  APROVADO: "APROVADO",
  REJEITADO: "REJEITADO",
} as const;
export type EstadoConvenio =
  (typeof EstadoConvenio)[keyof typeof EstadoConvenio];

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
export type EstadoInscricao =
  (typeof EstadoInscricao)[keyof typeof EstadoInscricao];

export const ClientType = {
  PARTICULAR: "PARTICULAR",
  LIVRARIA: "LIVRARIA",
  REVENDEDOR: "REVENDEDOR",
  ESCOLA: "ESCOLA",
  UNIVERSIDADE: "UNIVERSIDADE",
  EDITORA: "EDITORA",
} as const;
export type ClientType = (typeof ClientType)[keyof typeof ClientType];

export const ContactReason = {
  PUBLICAR: "PUBLICAR",
  COMPRAR: "COMPRAR",
  PARCERIA: "PARCERIA",
  SUPORTE_TECNICO: "SUPORTE_TECNICO",
  COMERCIAL: "COMERCIAL",
  OUTRO: "OUTRO",
} as const;
export type ContactReason = (typeof ContactReason)[keyof typeof ContactReason];
