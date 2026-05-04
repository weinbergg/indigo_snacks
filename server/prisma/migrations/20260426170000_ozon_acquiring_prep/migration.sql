ALTER TABLE "orders"
ADD COLUMN "paymentProvider" TEXT;

ALTER TABLE "orders"
ADD COLUMN "paymentProviderId" TEXT;

ALTER TABLE "orders"
ADD COLUMN "paymentExternalId" TEXT;

ALTER TABLE "orders"
ADD COLUMN "paymentRedirectUrl" TEXT;

ALTER TABLE "orders"
ADD COLUMN "paymentRawStatus" TEXT;

ALTER TABLE "orders"
ADD COLUMN "paymentLastError" TEXT;

ALTER TABLE "orders"
ADD COLUMN "paymentMetaJson" TEXT NOT NULL DEFAULT '{}';

ALTER TABLE "orders"
ADD COLUMN "paymentLastWebhookAt" DATETIME;

CREATE INDEX "orders_paymentProviderId_idx" ON "orders"("paymentProviderId");

CREATE INDEX "orders_paymentExternalId_idx" ON "orders"("paymentExternalId");
