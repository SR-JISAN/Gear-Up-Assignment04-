import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const adminDashboard = async () => {
  const totalUsers = await prisma.user.count();

  const totalCustomers = await prisma.user.count({
    where: {
      role: "CUSTOMER",
    },
  });

  const totalProviders = await prisma.user.count({
    where: {
      role: "PROVIDER",
    },
  });

  const totalProducts = await prisma.product.count();

  const totalOrders = await prisma.rentalOrder.count();

  const revenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: "SUCCESS",
    },
  });

  return {
    totalUsers,
    totalCustomers,
    totalProviders,
    totalProducts,
    totalOrders,
    totalRevenue: revenue._sum.amount || 0,
  };
};

const providerDashboard = async (providerId: string) => {
  const products = await prisma.product.count({
    where: {
      providerId,
    },
  });

  

  const orders = await prisma.rentalOrder.count({
    where: {
      rentalItem: {
        some: {
          product: {
            providerId,
          },
        },
      },
    },
  });

  const productList = await prisma.product.findMany({
    where: {
      providerId,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const earnings = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },

    where: {
      status: "SUCCESS",

      order: {
        rentalItem: {
          some: {
            product: {
              providerId,
            },
          },
        },
      },
    },
  });

  return {
    totalProducts: products,
    products: productList,
    totalOrders: orders,

    totalEarnings: earnings._sum.amount || 0,
  };
};

const customerDashboard = async (customerId: string) => {
  const totalOrders = await prisma.rentalOrder.count({
    where: {
      customerId,
    },
  });

  const activeOrders = await prisma.rentalOrder.count({
    where: {
      customerId,
      orderStatus: {
        in: ["PROCESSING", "PAID"],
      },
    },
  });


 const totalPayments = await prisma.payment.aggregate({
   where: {
     order: {
       customerId,
     },
     status: PaymentStatus.SUCCESS,
   },
   _sum: {
     amount: true,
   },
 });

 


  const totalRentedProducts = await prisma.rentalItem.count({
    where: {
      order: {
        customerId,
      },
    },
  });

  

  const payments = await prisma.payment.findMany({
    where: {
      order: {
        customerId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return {
    totalOrders,
    activeOrders,
    totalRentedProducts,
    totalPaymentAmount: totalPayments._sum.amount ?? 0,
    recentPayments: payments,
  };
};

export const DashboardService = {
  adminDashboard,
  providerDashboard,
  customerDashboard,
};
