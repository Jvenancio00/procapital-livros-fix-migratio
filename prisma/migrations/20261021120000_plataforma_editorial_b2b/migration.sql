-- Evolução incremental compatível para Plataforma Editorial & Comércio B2B Mult-Mercado
-- 100% aditiva e idempotente: garante primeiro que todos os tipos e tabelas base existem
-- mesmo em bases Neon/PostgreSQL antigas onde migrações anteriores diferiam.

-- 0. Garantir todos os Enums e Tabelas Base de forma 100% idempotente
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "Currency" AS ENUM ('KZ', 'MT', 'EUR', 'BRL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "NoteKind" AS ENUM ('BOOKMARK', 'NOTE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TipoInstituicao" AS ENUM ('ESCOLA', 'UNIVERSIDADE', 'LIVRARIA', 'EDITORA', 'OUTRO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EstadoConvenio" AS ENUM ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TipoEvento" AS ENUM ('LANCAMENTO', 'FEIRA', 'WORKSHOP', 'OUTRO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EstadoInscricao" AS ENUM ('CONFIRMADA', 'LISTA_ESPERA', 'CANCELADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ClientType" AS ENUM ('PARTICULAR', 'LIVRARIA', 'REVENDEDOR', 'ESCOLA', 'UNIVERSIDADE', 'EDITORA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ContactReason" AS ENUM ('PUBLICAR', 'COMPRAR', 'PARCERIA', 'SUPORTE_TECNICO', 'COMERCIAL', 'OUTRO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LoginEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "faq" JSONB,
    "parentId" TEXT,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Editora" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "logo" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "website" TEXT,
    CONSTRAINT "Editora_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Book" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "editora" TEXT NOT NULL,
    "description" TEXT,
    "isbn" TEXT,
    "coverUrl" TEXT,
    "pdfUrl" TEXT,
    "pages" INTEGER,
    "year" INTEGER,
    "free" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredFrom" TIMESTAMP(3),
    "featuredTo" TIMESTAMP(3),
    "categoryId" TEXT NOT NULL,
    "editoraId" TEXT,
    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Price" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "currency" "Currency" NOT NULL DEFAULT 'KZ',
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "orderId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceAtSaveKZ" DECIMAL(65,30),
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LibraryItem" (
    "id" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReadingNote" (
    "id" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "kind" "NoteKind" NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "ReadingNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "License" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "maxDevices" INTEGER NOT NULL DEFAULT 1,
    "devicesUsed" INTEGER NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "bookId" TEXT NOT NULL,
    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ConvenioPedido" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "tipo" "TipoInstituicao" NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "numAlunos" INTEGER,
    "mensagem" TEXT,
    "estado" "EstadoConvenio" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConvenioPedido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Evento" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'OUTRO',
    "descricao" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "endereco" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "capacidade" INTEGER,
    "editora" TEXT,
    "livroSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Inscricao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "estado" "EstadoInscricao" NOT NULL DEFAULT 'CONFIRMADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkinCode" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3),
    "eventoId" TEXT NOT NULL,
    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientProfile" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "type" "ClientType" NOT NULL DEFAULT 'PARTICULAR',
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverUrl" TEXT,
    "authorName" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContactRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "reason" "ContactReason" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "LoginEvent_userId_createdAt_idx" ON "LoginEvent"("userId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");
CREATE UNIQUE INDEX IF NOT EXISTS "Editora_slug_key" ON "Editora"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Editora_name_key" ON "Editora"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Book_slug_key" ON "Book"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Price_bookId_currency_key" ON "Price"("bookId", "currency");
CREATE INDEX IF NOT EXISTS "OrderItem_bookId_idx" ON "OrderItem"("bookId");
CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_bookId_key" ON "Review"("userId", "bookId");
CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_bookId_key" ON "Favorite"("userId", "bookId");
CREATE UNIQUE INDEX IF NOT EXISTS "LibraryItem_userId_bookId_key" ON "LibraryItem"("userId", "bookId");
CREATE INDEX IF NOT EXISTS "ReadingNote_userId_bookId_idx" ON "ReadingNote"("userId", "bookId");
CREATE UNIQUE INDEX IF NOT EXISTS "License_code_key" ON "License"("code");
CREATE INDEX IF NOT EXISTS "License_bookId_idx" ON "License"("bookId");
CREATE INDEX IF NOT EXISTS "ConvenioPedido_estado_idx" ON "ConvenioPedido"("estado");
CREATE UNIQUE INDEX IF NOT EXISTS "Evento_slug_key" ON "Evento"("slug");
CREATE INDEX IF NOT EXISTS "Evento_dataInicio_idx" ON "Evento"("dataInicio");
CREATE UNIQUE INDEX IF NOT EXISTS "Inscricao_checkinCode_key" ON "Inscricao"("checkinCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Inscricao_eventoId_email_key" ON "Inscricao"("eventoId", "email");
CREATE UNIQUE INDEX IF NOT EXISTS "ClientProfile_userId_key" ON "ClientProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_published_publishedAt_idx" ON "BlogPost"("published", "publishedAt");
CREATE INDEX IF NOT EXISTS "ContactRequest_reason_createdAt_idx" ON "ContactRequest"("reason", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_createdAt_idx" ON "NewsletterSubscriber"("createdAt");

-- 1. Expansão de Enums existentes (sem remover valores)
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'AWAITING_PAYMENT';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

ALTER TYPE "ClientType" ADD VALUE IF NOT EXISTS 'EMPRESA_INSTITUICAO';
ALTER TYPE "ClientType" ADD VALUE IF NOT EXISTS 'DISTRIBUIDOR_PARCEIRO';

ALTER TYPE "ContactReason" ADD VALUE IF NOT EXISTS 'EDITORA';
ALTER TYPE "ContactReason" ADD VALUE IF NOT EXISTS 'LIVRARIA';
ALTER TYPE "ContactReason" ADD VALUE IF NOT EXISTS 'ESCOLA';
ALTER TYPE "ContactReason" ADD VALUE IF NOT EXISTS 'PARCEIRO_COMERCIAL';
ALTER TYPE "ContactReason" ADD VALUE IF NOT EXISTS 'INVESTIMENTO';
ALTER TYPE "ContactReason" ADD VALUE IF NOT EXISTS 'LEITOR';

-- 2. Novos Enums da Plataforma Editorial & B2B
DO $$ BEGIN CREATE TYPE "MarketCode" AS ENUM ('AO', 'MZ', 'PT', 'BR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EducationLevel" AS ENUM ('ENSINO_PRIMARIO', 'ENSINO_SECUNDARIO', 'TECNICO_PROFISSIONAL', 'ENSINO_SUPERIOR', 'GERAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING_TRANSFER', 'UNDER_REVIEW', 'CONFIRMED', 'FAILED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "StockMovementType" AS ENUM ('INITIAL_SEED', 'IMPORT_IN', 'MANUAL_ADJUSTMENT', 'CHECKOUT_RESERVE', 'RESERVATION_RELEASE', 'SALE_CONFIRMED', 'ORDER_REFUND'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'COMMITTED', 'RELEASED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ImportMode" AS ENUM ('UPDATE_STOCK', 'UPDATE_PRICES', 'IMPORT_BOOKS', 'COMBINED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'QUOTED', 'APPROVED', 'CONVERTED_ORDER', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Colunas adicionais em tabelas existentes
ALTER TABLE "ContactRequest" ADD COLUMN IF NOT EXISTS "company" TEXT;

ALTER TABLE "Editora" ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "isbnNormalized" TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "educationLevel" "EducationLevel";
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "schoolGrade" TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "subject" TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "academicYear" INTEGER;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "countryOrigin" TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "allowPreorder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "allowQuote" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Price" ADD COLUMN IF NOT EXISTS "marketActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Price" ADD COLUMN IF NOT EXISTS "minWholesaleQty" INTEGER;

ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "taxId" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "countryCode" "MarketCode" NOT NULL DEFAULT 'MZ';
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "billingAddress" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "contactRole" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "approvedB2B" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "paymentTermsDays" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ClientProfile" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "countryCode" "MarketCode" NOT NULL DEFAULT 'MZ';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "buyerName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "buyerPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "buyerTaxId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "clientType" "ClientType" NOT NULL DEFAULT 'PARTICULAR';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingCity" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingPostalCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "subtotalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoiceRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "reservationExpiresAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "titleSnapshot" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "isbnSnapshot" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "publisherSnapshot" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "currencySnapshot" "Currency";
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "discountPercent" INTEGER NOT NULL DEFAULT 0;

-- 4. Novas tabelas da Plataforma Editorial, Stock, Importações, Pagamentos, Cotações, Emails e Auditoria
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MarketConfig" (
    "code" "MarketCode" NOT NULL,
    "name" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "isoCurrency" TEXT NOT NULL,
    "taxRatePercent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shippingFlatFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "freeShippingThreshold" DECIMAL(65,30),
    "estimatedDeliveryDays" TEXT NOT NULL DEFAULT '2 a 5 dias úteis',
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bankAccountDetails" TEXT,
    "localMethodName" TEXT,
    "localMethodEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cardGatewayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quoteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketConfig_pkey" PRIMARY KEY ("code")
);

CREATE TABLE IF NOT EXISTS "Warehouse" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" "MarketCode" NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockReservation" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "orderId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "previousQty" INTEGER NOT NULL,
    "newQty" INTEGER NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stockItemId" TEXT NOT NULL,
    "importBatchId" TEXT,
    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ImportBatch" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mode" "ImportMode" NOT NULL DEFAULT 'COMBINED',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "selectedActions" JSONB,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "createdBooks" INTEGER NOT NULL DEFAULT 0,
    "updatedStock" INTEGER NOT NULL DEFAULT 0,
    "updatedPrices" INTEGER NOT NULL DEFAULT 0,
    "skippedRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "summaryJson" JSONB,
    "reportJson" JSONB,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PaymentRecord" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING_TRANSFER',
    "externalReference" TEXT,
    "transferProofRef" TEXT,
    "notes" TEXT,
    "reviewedByEmail" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "orderId" TEXT,
    "signatureOk" BOOLEAN NOT NULL DEFAULT false,
    "payloadJson" JSONB,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuoteRequest" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organizationName" TEXT,
    "taxId" TEXT,
    "clientType" "ClientType" NOT NULL DEFAULT 'ESCOLA',
    "countryCode" "MarketCode" NOT NULL DEFAULT 'MZ',
    "currency" "Currency" NOT NULL DEFAULT 'MT',
    "academicYear" INTEGER,
    "deliveryAddress" TEXT,
    "notes" TEXT,
    "estimatedTotal" DECIMAL(65,30),
    "quotedTotal" DECIMAL(65,30),
    "adminNotes" TEXT,
    "validUntil" TIMESTAMP(3),
    "convertedOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuoteItem" (
    "id" TEXT NOT NULL,
    "bookSlug" TEXT,
    "bookTitle" TEXT NOT NULL,
    "isbn" TEXT,
    "publisher" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPriceQuoted" DECIMAL(65,30),
    "notes" TEXT,
    "quoteRequestId" TEXT NOT NULL,
    "bookId" TEXT,
    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT,
    "errorMessage" TEXT,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "ip" TEXT,
    "detailsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- 5. Índices únicos e compostos
CREATE UNIQUE INDEX IF NOT EXISTS "Book_isbnNormalized_key" ON "Book"("isbnNormalized");
CREATE INDEX IF NOT EXISTS "Book_isbnNormalized_idx" ON "Book"("isbnNormalized");
CREATE INDEX IF NOT EXISTS "Book_educationLevel_schoolGrade_idx" ON "Book"("educationLevel", "schoolGrade");
CREATE INDEX IF NOT EXISTS "Book_active_featured_idx" ON "Book"("active", "featured");

CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "Warehouse_code_key" ON "Warehouse"("code");
CREATE INDEX IF NOT EXISTS "Warehouse_countryCode_active_idx" ON "Warehouse"("countryCode", "active");

CREATE UNIQUE INDEX IF NOT EXISTS "StockItem_bookId_warehouseId_key" ON "StockItem"("bookId", "warehouseId");
CREATE INDEX IF NOT EXISTS "StockItem_warehouseId_idx" ON "StockItem"("warehouseId");

CREATE INDEX IF NOT EXISTS "StockReservation_orderId_idx" ON "StockReservation"("orderId");
CREATE INDEX IF NOT EXISTS "StockReservation_status_expiresAt_idx" ON "StockReservation"("status", "expiresAt");

CREATE INDEX IF NOT EXISTS "StockMovement_stockItemId_createdAt_idx" ON "StockMovement"("stockItemId", "createdAt");
CREATE INDEX IF NOT EXISTS "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

CREATE INDEX IF NOT EXISTS "ImportBatch_createdAt_idx" ON "ImportBatch"("createdAt");

CREATE INDEX IF NOT EXISTS "PaymentRecord_orderId_createdAt_idx" ON "PaymentRecord"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "PaymentRecord_status_idx" ON "PaymentRecord"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentWebhookEvent_eventId_key" ON "PaymentWebhookEvent"("eventId");

CREATE UNIQUE INDEX IF NOT EXISTS "QuoteRequest_quoteNumber_key" ON "QuoteRequest"("quoteNumber");
CREATE INDEX IF NOT EXISTS "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "QuoteRequest_email_idx" ON "QuoteRequest"("email");

CREATE INDEX IF NOT EXISTS "QuoteItem_quoteRequestId_idx" ON "QuoteItem"("quoteRequestId");

CREATE INDEX IF NOT EXISTS "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");
CREATE INDEX IF NOT EXISTS "EmailLog_status_idx" ON "EmailLog"("status");

CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- 6. Chaves estrangeiras
DO $$ BEGIN ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
