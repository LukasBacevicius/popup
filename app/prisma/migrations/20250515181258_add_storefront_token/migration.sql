-- CreateTable
CREATE TABLE "StorefrontToken" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shopDomain" TEXT NOT NULL,
    "shopUrl" TEXT NOT NULL,

    CONSTRAINT "StorefrontToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StorefrontToken_shop_idx" ON "StorefrontToken"("shop");
