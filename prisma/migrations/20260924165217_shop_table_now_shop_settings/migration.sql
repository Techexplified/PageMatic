/*
  Warnings:

  - You are about to drop the `Shop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_shopId_fkey";

-- DropTable
DROP TABLE "Shop";

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "pageCredits" INTEGER NOT NULL DEFAULT 20,
    "iterationTokens" INTEGER NOT NULL DEFAULT 100,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "ShopSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
