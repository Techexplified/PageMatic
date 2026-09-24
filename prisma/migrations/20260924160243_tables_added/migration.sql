-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "pageCredits" INTEGER NOT NULL DEFAULT 20,
    "iterationTokens" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'PRODUCT',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "stylePreset" TEXT NOT NULL DEFAULT 'minimal',
    "shopifyPageId" TEXT,
    "targetProductId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "contentJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Page_shopId_idx" ON "Page"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_shopId_handle_key" ON "Page"("shopId", "handle");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
