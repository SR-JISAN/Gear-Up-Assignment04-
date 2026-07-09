import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IRentalItemData, IUpdateOrder } from "./order.interface";
import { order_status, Role } from "../../../generated/prisma/enums";

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


const updateOrderInDB = async (
  orderId: number,
  payload: IUpdateOrder,
  user: JwtPayload,
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      rentalItem: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  
  if (user.role === Role.CUSTOMER) {
    if (order.customerId !== user.id) {
      throw new Error("You are not authorized");
    }

    if (payload.orderStatus !== order_status.CANCELLED) {
      throw new Error("Customer can only cancel orders");
    }

    if (order.orderStatus !== order_status.PROCESSING) {
      throw new Error("Only processing orders can be cancelled");
    }
  }

 
  if (user.role === Role.PROVIDER) {
    const isProviderOrder = order.rentalItem.every(
      (item) => item.product.providerId === user.id,
    );

    if (!isProviderOrder) {
      throw new Error("You are not authorized");
    }

    const allowedStatus : order_status[] = [
      order_status.CONFIRM,
      order_status.PICKED_UP,
      order_status.RETURNED,
    ];

    if (payload.orderStatus && !allowedStatus.includes(payload.orderStatus)) {
      throw new Error("Invalid order status");
    }
  }

 
  const result = await prisma.rentalOrder.update({
    where: {
      id: orderId,
    },
    data: {
      orderStatus: payload.orderStatus,
      pickUpDate: payload.pickupDate,
      returnDate: payload.returnDate,
      pickUpAddress: payload.pickUpAddress,
    },
    include: {
      rentalItem: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const getOrdersInDB = async (user:JwtPayload)=>{
  if(!user){
    throw new Error("User not found")
  };
  if (user.role === Role.ADMIN) {
     return await prisma.rentalOrder.findMany({
         include: {
            customer: {
             select: {
              id: true,
              name: true,
              email: true,
              },
        },
       rentalItem: {
         include: {
           product: {
             include: {
               category: true,
             },
           },
         },
       },
     },
     orderBy: {
       createdAt: "asc",
     },
   });
 };

 if (user.role === Role.CUSTOMER) {
   return await prisma.rentalOrder.findMany({
     where: {
       customerId: user.id,
     },
     include: {
       rentalItem: {
         include: {
           product: true,
         },
       },
     },
     orderBy: {
       createdAt: "asc",
     },
   });
 };


  const result = await prisma.rentalOrder.findMany({
    where: {
      rentalItem: {
        some: {
          product: {
            providerId: user.id,
          },
        },
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      rentalItem: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });


return result;

}

export const orderService = {
    rentalOrderInDB,
    updateOrderInDB,
    getOrdersInDB
};