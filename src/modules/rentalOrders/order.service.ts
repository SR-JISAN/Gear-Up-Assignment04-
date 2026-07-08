import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IRentalItemData } from "./order.interface";

const rentalOrderInDB = async(payload: any, user: JwtPayload)=>{

  if (!payload.pickUpAddress) {
    throw new Error("Pickup address is required");
  }


  if (!payload.items || !Array.isArray(payload.items)) {
    throw new Error("Items are required");
  }

  if (payload.items.length === 0) {
    throw new Error("At least one product is required");
  }

  let totalAmount = 0;

  const rentalItems: IRentalItemData[] = [];

  for (const item of payload.items) {

    if (!item.productId) {
      throw new Error("Product id is required");
    }

    if (!item.quantity) {
      throw new Error("Quantity is required");
    }

    if (item.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    if (!item.startDate) {
      throw new Error("Start date is required");
    }

    if (!item.endDate) {
      throw new Error("End date is required");
    }

    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < item.quantity) {
      throw new Error("Insufficient stock");
    }

    const start = new Date(item.startDate);
    const end = new Date(item.endDate);

    if (start >= end) {
      throw new Error("End date must be greater than start date");
    }

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const subTotal =
      Number(product.price_per_day) *
      totalDays *
      item.quantity;

    totalAmount += subTotal;

    rentalItems.push({
      productId: product.id,
      quantity: item.quantity,
      startDate: start,
      endDate: end,
      totalDays,
      pricePerDay: Number(product.price_per_day),
      subTotal,
    });
  }

  const result = await prisma.$transaction(async (tx) => {

    const order = await tx.rentalOrder.create({
      data: {
        customerId: user.id,
        totalAmount,
        pickUpAddress: payload.pickUpAddress,

        rentalItem: {
          create: rentalItems,
        },
      },

      include: {
        rentalItem: true,
      },
    });

    return order;
  });

  return result;
};



export const orderService = {
    rentalOrderInDB
};