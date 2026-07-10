/*
  Warnings:

  - You are about to drop the column `stripCustomerId` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "stripCustomerId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripCustomerId" TEXT;
