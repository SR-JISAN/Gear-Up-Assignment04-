-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "User_Status" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "product_condition" AS ENUM ('NEW', 'USED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "product_availability" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PROCESSING', 'PLACED', 'CONFIRM', 'PAID', 'PICKED_UP', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_orders" (
    "id" SERIAL NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "orderStatus" "order_status" NOT NULL DEFAULT 'PROCESSING',
    "pickUpAddress" TEXT NOT NULL,
    "pickUpDate" TIMESTAMP(3),
    "returnDate" TIMESTAMP(3),
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "details" TEXT NOT NULL,
    "brand" VARCHAR(150) NOT NULL,
    "stock" INTEGER NOT NULL,
    "price_per_day" DECIMAL(10,2) NOT NULL,
    "product_image" TEXT,
    "condition" "product_condition" NOT NULL DEFAULT 'NEW',
    "availability" "product_availability" NOT NULL DEFAULT 'AVAILABLE',
    "categoryId" INTEGER NOT NULL,
    "providerId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "rental_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "subTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "customer_status" "User_Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "rental_orders" ADD CONSTRAINT "rental_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_items" ADD CONSTRAINT "rental_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "rental_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_items" ADD CONSTRAINT "rental_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
