-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PROCESSING', 'PLACED', 'CONFIRM', 'PAID', 'PICKED_UP', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "productOrders" (
    "id" SERIAL NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "orderStatus" "order_status" NOT NULL DEFAULT 'PROCESSING',
    "pickUpAddress" TEXT NOT NULL,
    "pickUpDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productOrders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "productOrders" ADD CONSTRAINT "productOrders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
