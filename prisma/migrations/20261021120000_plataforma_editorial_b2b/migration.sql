-- Evolução incremental compatível para Plataforma Editorial & Comércio B2B Mult-Mercado
-- 100% aditiva e idempotente: preserva todas as tabelas, relações e dados reais existentes.

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
