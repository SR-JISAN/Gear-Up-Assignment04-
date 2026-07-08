/*
  Warnings:

  - You are about to drop the column `Product_image` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "Product_image",
ADD COLUMN     "product_image" TEXT;
