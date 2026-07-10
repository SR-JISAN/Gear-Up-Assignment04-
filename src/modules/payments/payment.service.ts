import { prisma } from "../../lib/prisma"
import { strip } from "../../lib/strip";

const createCheckoutInDB = async( userId: string,
  orderId: number)=>{
  return await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.findFirst({
      where: {
        id: orderId,
        customerId: userId,
      },
      include: {
        rentalItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found or you are not authorized to pay for this order."
      );
    }

    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    let stripeCustomerId = user.stripCustomerId;

    if (!stripeCustomerId) {
      const customer = await strip.customers.create({
        email: user.email,
        name: user.name,
      });

      stripeCustomerId = customer.id;

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripCustomerId: stripeCustomerId,
        },
      });
    }

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: Number(order.totalAmount),
        transactionId: crypto.randomUUID(),
        gateway: "STRIPE",
        status: "PENDING",
      },
    });

    const session = await strip.checkout.sessions.create({
      customer: stripeCustomerId,

      payment_method_types: ["card"],

      mode: "payment",

      line_items: order.rentalItem.map((item) => ({
        quantity: item.quantity,

        price_data: {
          currency: "usd",

          unit_amount: Number(item.subTotal) * 100,

          product_data: {
            name: item.product.title,
          },
        },
      })),

      metadata: {
        paymentId: payment.id.toString(),
        orderId: order.id.toString(),
      },

      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    return {
      checkoutUrl: session.url,
    };
  });
}

export const paymentsService ={
    createCheckoutInDB
}