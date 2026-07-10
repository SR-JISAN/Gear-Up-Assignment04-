import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IRentalItemData, IUpdateOrder } from "./order.interface";
import { order_status, Role } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import AppError from "../../app/errors/AppError";
import httpStatus from "http-status";


const rentalOrderInDB = async(payload: any, user: JwtPayload)=>{

  if (!payload.pickUpAddress) {
    throw new AppError(httpStatus.BAD_REQUEST, "Pickup address is required");
  }


  if (!payload.items || !Array.isArray(payload.items)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Items are required");
  }

  if (payload.items.length === 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "At least one product is required",
    );
  }

  let totalAmount = 0;

  const rentalItems: IRentalItemData[] = [];

  for (const item of payload.items) {

    if (!item.productId) {
      throw new AppError(httpStatus.BAD_REQUEST, "Product id is required");
    }

    if (!item.quantity) {
      throw new AppError(httpStatus.BAD_REQUEST, "Quantity is required");
    }

    if (item.quantity <= 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Quantity must be greater than zero",
      );
    }

    if (!item.startDate) {
      throw new AppError(httpStatus.BAD_REQUEST, "Start date is required");
    }

    if (!item.endDate) {
      throw new AppError(httpStatus.BAD_REQUEST, "End date is required");
    }

    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    if (product.stock < item.quantity) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock");
    }

    const start = new Date(item.startDate);
    const end = new Date(item.endDate);

    if (start >= end) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "End date must be greater than start date",
      );
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
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  
  if (user.role === Role.CUSTOMER) {
    if (order.customerId !== user.id) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    if (payload.orderStatus !== order_status.CANCELLED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Customer can only cancel orders",
      );
    }

    if (order.orderStatus !== order_status.PROCESSING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only processing orders can be cancelled",
      );
    }
  }

 
  if (user.role === Role.PROVIDER) {
    const isProviderOrder = order.rentalItem.every(
      (item) => item.product.providerId === user.id,
    );

    if (!isProviderOrder) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
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

  const updateData: Prisma.RentalOrderUpdateInput = {
    orderStatus: payload.orderStatus,
  };

  if (payload.orderStatus === order_status.PICKED_UP) {
    updateData.pickUpDate = new Date();
  }

  if (payload.orderStatus === order_status.RETURNED) {
    updateData.returnDate = new Date();
  }

 
  const result = await prisma.rentalOrder.update({
    where: {
      id: orderId,
    },
    data: {
      ...updateData,
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
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
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

const getSingleOrderInDB = async (user:JwtPayload, id:number)=>{
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }
      if (user.role === Role.ADMIN) {
        const result = await prisma.rentalOrder.findUnique({
          where:{id:id},
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
          }
        });
        if (!result) {
          throw new AppError(httpStatus.NOT_FOUND, "Order not found");
        }
        return result;
      };

      if (user.role === Role.CUSTOMER) {
       const result = await prisma.rentalOrder.findFirst({
          where: {
            id: id,
            customerId: user.id,
          },
          include: {
            rentalItem: {
              include: {
                product: true,
              },
            },
          },
        });
        if (!result) {
          throw new AppError(httpStatus.NOT_FOUND, "Order not found");
        }
        return result;
      };

      const result = await prisma.rentalOrder.findFirst({
        where: {
          id: id,
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
      });
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Order not found");
      }

      return result;
}

export const orderService = {
    rentalOrderInDB,
    updateOrderInDB,
    getOrdersInDB,
    getSingleOrderInDB
};